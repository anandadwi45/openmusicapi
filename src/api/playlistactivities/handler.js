const autoBind = require('auto-bind')

class PlaylistActivitiesHandler {
  constructor (service) {
    const { playlistActivitiesService, playlistsService } = service
    this._service = playlistActivitiesService
    this._playlistsService = playlistsService

    autoBind(this)
  }

  async getPlaylistActivitiesByIdHandler (request, h) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._playlistsService.verifyPlaylistAccess(id, credentialId)
    let activities = null
    activities = await this._service.getPlaylistActivitiesById(id, credentialId)

    return {
      status: 'success',
      data: {
        playlistId: id,
        activities
      }
    }
  }
}

module.exports = PlaylistActivitiesHandler
