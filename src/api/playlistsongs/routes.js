const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: handler.postPlaylistSongsHandler,
    options: {
      auth: 'musicapp_jwt'
    }
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: handler.getPlaylistSongsHandler,
    options: {
      auth: 'musicapp_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: handler.deletePlaylistSongsByIdHandler,
    options: {
      auth: 'musicapp_jwt'
    }
  }
]

module.exports = routes
