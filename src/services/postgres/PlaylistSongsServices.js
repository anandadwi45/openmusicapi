const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class PlaylistSongsServices {
  constructor () {
    this._pool = new Pool()
  }

  async addSongsPlaylist (playlistId, songId) {
    const id = `playlistsongs-${nanoid(16)}`
    const result = await this._pool.query({
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId]
    })
    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan ke playlist')
    }
    return result.rows[0].id
  }

  async deleteSongsPlaylist (playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
    }
  }
}

module.exports = PlaylistSongsServices
