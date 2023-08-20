const autoBind = require('auto-bind')

class AlbumsHandler {
  constructor (service, validator, musicsServices) {
    this._service = service
    this._validator = validator
    this._musicsService = musicsServices

    autoBind(this)
  }

  async postAlbumHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { name, year } = request.payload

    const albumId = await this._service.addAlbum({ name, year })

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId
      }
    })
    response.code(201)
    return response
  }

  async getAlbumByIdHandler (request, h) {
    const { id } = request.params
    const album = await this._service.getAlbumById(id)
    album.songs = await this._musicsService.getMusicByAlbumId(id)
    return {
      status: 'success',
      data: {
        album
      }
    }
  }

  async putAlbumByIdHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { id } = request.params

    await this._service.editAlbumById(id, request.payload)

    return {
      status: 'success',
      message: 'Album berhasil diperbarui'
    }
  }

  async deleteAlbumByIdHandler (request, h) {
    const { id } = request.params
    await this._service.deleteAlbumById(id)

    return {
      status: 'success',
      message: 'Album berhasil dihapus'
    }
  }

  async postLikesAlbumHandler (request, h) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.checkAlbum(id)

    const like = await this._service.addLikeAndDislikeAlbum(id, credentialId)

    return h.response({
      status: 'success',
      message: `Berhasil ${like} Album`
    }).code(201)
  }

  async getLikesAlbumByIdhandler (request, h) {
    const { id } = request.params
    const { likes, source } = await this._service.getLikesAlbumById(id)

    const response = h.response({
      status: 'success',
      data: {
        likes
      }
    })

    response.header('X-Data-Source', source)
    return response
  }

  async deleteLikesAlbumByIdhandler (request, h) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.checkAlbum(id)

    await this._service.unlikeAlbumById(id, credentialId)

    return h.response({
      status: 'success',
      message: 'Album batal disukai'
    }).code(200)
  }
}

module.exports = AlbumsHandler
