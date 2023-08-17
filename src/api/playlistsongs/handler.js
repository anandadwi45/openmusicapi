const autoBind = require('auto-bind')

class PlaylistSongsHandler {
  constructor (service, validator) {
    const {
      playlistSongsService, musicsServices, playlistsService, playlistActivitiesService
    } = service
    this._service = playlistSongsService
    this._playlistsService = playlistsService
    this._musicsService = musicsServices
    this._playlistActivitiesService = playlistActivitiesService
    this._validator = validator

    autoBind(this)
  }

  async postPlaylistSongsHandler (request, h) {
    const { songId } = request.payload
    const { id: playlistId } = request.params
    const { id: credentialId } = request.auth.credentials
    this._validator.validatePlaylistSongsPayload({ playlistId, songId })

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
    await this._musicsService.getMusicById(songId)
    await this._service.addSongsPlaylist(playlistId, songId)
    await this._playlistActivitiesService.addPlaylistActivities(playlistId, songId, credentialId, 'add')
    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan ke playlist'
    })
    response.code(201)
    return response
  }

  async getPlaylistSongsHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { id: playlistId } = request.params
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
    const playlist = await this._playlistsService.getPlaylistsById(playlistId)
    const songs = await this._musicsService.getMusicByPlaylistId(playlistId)
    playlist.songs = songs
    return {
      status: 'success',
      data: {
        playlist
      }
    }
  }

  async deletePlaylistSongsByIdHandler (request, h) {
    const { id: playlistId } = request.params
    const { songId } = request.payload
    const { id: credentialId } = request.auth.credentials
    this._validator.validatePlaylistSongsPayload({ playlistId, songId })

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
    await this._service.deleteSongsPlaylist(playlistId, songId)
    await this._playlistActivitiesService.addPlaylistActivities(playlistId, songId, credentialId, 'delete')
    return {
      status: 'success',
      message: 'Song berhasil dihapus dari playlist'
    }
  }
}

module.exports = PlaylistSongsHandler
