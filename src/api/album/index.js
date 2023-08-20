const AlbumsHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, validator, musicsServices }) => {
    const albumsHandler = new AlbumsHandler(service, validator, musicsServices)
    server.route(routes(albumsHandler))
  }
}
