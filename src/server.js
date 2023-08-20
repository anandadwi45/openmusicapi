require('dotenv').config()
const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')
const path = require('path')

const musics = require('./api/music')
const albums = require('./api/album')
const MusicsServices = require('./services/postgres/MusicsServices')
const MusicValidator = require('./validator/musics')
const AlbumsServices = require('./services/postgres/AlbumsServices')
const AlbumValidator = require('./validator/albums')

const users = require('./api/users')
const UsersService = require('./services/postgres/UsersServices')
const UsersValidator = require('./validator/users')

const authentications = require('./api/authentication')
const AuthenticationsService = require('./services/postgres/AuthenticationsServices')
const TokenManager = require('./tokenize/TokenManager')
const AuthenticationsValidator = require('./validator/authentications')

const playlists = require('./api/playlist')
const PlaylistsService = require('./services/postgres/PlaylistsServices')
const PlaylistsValidator = require('./validator/playlists')

const playlistsSongs = require('./api/playlistsongs')
const PlaylistsSongsService = require('./services/postgres/PlaylistSongsServices')
const PlaylistSongsValidator = require('./validator/playlistsongs')

const collaborations = require('./api/collaboration')
const CollaborationsService = require('./services/postgres/CollaborationsServices')
const CollaborationsValidator = require('./validator/collaborations')

const playlistActivities = require('./api/playlistactivities')
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesServices')

const _exports = require('./api/exports')
const ProducerService = require('./services/rabbitmq/ProducerService')
const ExportsValidator = require('./validator/exports')

const uploads = require('./api/uploads')
const StorageService = require('./services/storage/StorageService')
const UploadsValidator = require('./validator/uploads')

const CacheService = require('./services/redis/CacheService')

const ClientError = require('./exceptions/ClientError')

const init = async () => {
  const cacheService = new CacheService()
  const collaborationsService = new CollaborationsService()
  const albumsServices = new AlbumsServices(cacheService)
  const musicsServices = new MusicsServices()
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const playlistsService = new PlaylistsService(collaborationsService)
  const playlistSongsService = new PlaylistsSongsService()
  const playlistActivitiesService = new PlaylistActivitiesService()
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'))

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register([
    {
      plugin: Jwt
    },
    {
      plugin: Inert
    }
  ])

  server.auth.strategy('musicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  })

  await server.register([
    {
      plugin: musics,
      options: {
        service: musicsServices,
        validator: MusicValidator
      }
    },
    {
      plugin: albums,
      options: {
        service: albumsServices,
        validator: AlbumValidator,
        musicsServices
      }
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator
      }
    },
    {
      plugin: collaborations,
      options: {
        service: {
          collaborationsService,
          playlistsService,
          usersService
        },
        validator: CollaborationsValidator
      }
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator
      }
    },
    {
      plugin: playlistsSongs,
      options: {
        service: {
          playlistSongsService,
          musicsServices,
          playlistsService,
          playlistActivitiesService
        },
        validator: PlaylistSongsValidator
      }
    },
    {
      plugin: playlistActivities,
      options: {
        service: {
          playlistActivitiesService,
          playlistsService
        }
      }
    },
    {
      plugin: _exports,
      options: {
        ProducerService,
        PlaylistsService: playlistsService,
        ExportsValidator
      }
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
        albumsServices
      }
    }
  ])

  server.ext('onPreResponse', (request, h) => {
    const { response } = request
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      })
      newResponse.code(response.statusCode)
      return newResponse
    }
    return response.continue || response
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
