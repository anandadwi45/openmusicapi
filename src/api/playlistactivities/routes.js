const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: handler.getPlaylistActivitiesByIdHandler,
    options: {
      auth: 'musicapp_jwt'
    }
  }
]

module.exports = routes
