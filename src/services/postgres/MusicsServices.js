const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const { mapDBToModelMusics } = require('../../utils')
const NotFoundError = require('../../exceptions/NotFoundError')

class MusicsService {
  constructor () {
    this._pool = new Pool()
  }

  async addMusic ({ title, year, genre, performer, duration, albumId }) {
    const id = nanoid(16)

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getMusics (title = '', performer = '') {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2',
      values: [`%${title}%`, `%${performer}%`]
    }
    const result = await this._pool.query(query)
    return result.rows
  }

  async getMusicById (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    return result.rows.map(mapDBToModelMusics)[0]
  }

  async getMusicByAlbumId (albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [albumId]
    }

    const result = await this._pool.query(query)

    return result.rows
  }

  async getMusicByPlaylistId (playlistId) {
    const result = await this._pool.query({
      text: `SELECT songs.id, songs.title, songs.performer FROM songs 
            LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id 
            WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId]
    })
    return result.rows
  }

  async editMusicById (id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan')
    }
  }

  async deleteMusicById (id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan')
    }
  }
}

module.exports = MusicsService
