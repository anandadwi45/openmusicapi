const autoBind = require('auto-bind')

class ExportsHandler {
  constructor (PlaylistService, ProducerService, ExportsValidator) {
    this._playlistsService = PlaylistService
    this._producerService = ProducerService
    this._exportsValidator = ExportsValidator

    autoBind(this)
  }

  async postExportPlaylistsHandler (request, h) {
    this._exportsValidator.validateExportPlaylistsPayload(request.payload)

    const { id: credentialId } = request.auth.credentials
    const { playlistId } = request.params

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail
    }

    await this._producerService.sendMessage('export:playlists', JSON.stringify(message))

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean'
    })
    response.code(201)
    return response
  }
}

module.exports = ExportsHandler
