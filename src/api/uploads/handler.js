const autoBind = require('auto-bind')
const config = require('../../utils/config.js')

class UploadsHandler {
  constructor (service, validator, albumsServices) {
    this._service = service
    this._albumsService = albumsServices
    this._validator = validator

    autoBind(this)
  }

  async postUploadImageHandler (request, h) {
    const { id } = request.params
    const { cover } = request.payload

    await this._albumsService.checkAlbum(id)

    this._validator.validateImageHeaders(cover.hapi.headers)

    const filename = await this._service.writeFile(cover, cover.hapi)
    const fileLocation = `http://${config.app.host}:${config.app.port}/albums/covers/${filename}`

    await this._albumsService.editAlbumToAddCoverById(id, fileLocation)

    const response = h.response({
      status: 'success',
      message: 'Cover berhasil diupload'
    })

    response.code(201)
    return response
  }
}

module.exports = UploadsHandler
