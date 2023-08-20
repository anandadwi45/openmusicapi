const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const { mapDBToModelAlbums } = require('../../utils')
const NotFoundError = require('../../exceptions/NotFoundError')
const ClientError = require('../../exceptions/ClientError')

class AlbumsServices {
  constructor (cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
  }

  async addAlbum ({ name, year }) {
    const id = nanoid(16)

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbumById (id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    return result.rows.map(mapDBToModelAlbums)[0]
  }

  async editAlbumById (id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
    }
  }

  async deleteAlbumById (id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
    }
  }

  async checkAlbum (id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }
  }

  async editAlbumToAddCoverById (id, fileLocation) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [fileLocation, id]
    }

    await this._pool.query(query)
  }

  async addLikeAndDislikeAlbum (albumId, userId) {
    const like = 'like'

    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId]
    }

    const result = await this._pool.query(query)

    if (result.rowCount) {
      throw new ClientError('TIdak dapat menambahkan like')
    } else {
      const id = `album-like-${nanoid(16)}`

      const queryLike = {
        text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
        values: [id, userId, albumId]
      }

      await this._pool.query(queryLike)
      await this._cacheService.delete(`user_album_likes:${albumId}`)
    }
    await this._cacheService.delete(`user_album_likes:${albumId}`)
    return like
  }

  async getLikesAlbumById (id) {
    try {
      const source = 'cache'
      const likes = await this._cacheService.get(`user_album_likes:${id}`)
      return { likes: +likes, source }
    } catch (error) {
      await this.checkAlbum(id)

      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [id]
      }

      const result = await this._pool.query(query)

      const likes = result.rowCount

      await this._cacheService.set(`user_album_likes:${id}`, likes)

      const source = 'server'

      return { likes, source }
    }
  }

  async unlikeAlbumById (albumId, userId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId]
    }

    const result = await this._pool.query(query)

    const queryUnlike = {
      text: 'DELETE FROM user_album_likes WHERE id = $1 RETURNING id',
      values: [result.rows[0].id]
    }

    await this._pool.query(queryUnlike)
    await this._cacheService.delete(`user_album_likes:${albumId}`)
  }
}

module.exports = AlbumsServices
