const autoBind = require('auto-bind')

class MusicsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    autoBind(this)
  }

  async postMusicHandler (request, h) {
    this._validator.validateMusicPayload(request.payload)

    const songId = await this._service.addMusic(request.payload)

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId
      }
    })
    response.code(201)
    return response
  }

  async getMusicsHandler (request) {
    const { title, performer } = request.query
    const songs = await this._service.getMusics(title, performer)
    return {
      status: 'success',
      data: {
        songs
      }
    }
  }

  async getMusicByIdHandler (request, h) {
    const { id } = request.params
    const song = await this._service.getMusicById(id)
    return {
      status: 'success',
      data: {
        song
      }
    }
  }

  async putMusicByIdHandler (request, h) {
    this._validator.validateMusicPayload(request.payload)
    const { title, year, genre, performer, duration, albumId } = request.payload
    const { id } = request.params

    await this._service.editMusicById(id, { title, year, genre, performer, duration, albumId })

    return {
      status: 'success',
      message: 'Music berhasil diperbarui'
    }
  }

  async deleteMusicByIdHandler (request, h) {
    const { id } = request.params
    await this._service.deleteMusicById(id)

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus'
    }
  }
}

module.exports = MusicsHandler
