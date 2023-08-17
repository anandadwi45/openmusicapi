require('dotenv').config()
const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')

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

const ClientError = require('./exceptions/ClientError')

const init = async () => {
  const collaborationsService = new CollaborationsService()
  const musicsServices = new MusicsServices()
  const albumsServices = new AlbumsServices()
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const playlistsService = new PlaylistsService(collaborationsService)
  const playlistSongsService = new PlaylistsSongsService()
  const playlistActivitiesService = new PlaylistActivitiesService()

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
        validator: AlbumValidator
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
