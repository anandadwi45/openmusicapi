const ExportsHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { PlaylistsService, ProducerService, ExportsValidator }) => {
    const exportsHandler = new ExportsHandler(PlaylistsService, ProducerService, ExportsValidator)
    server.route(routes(exportsHandler))
  }
}
