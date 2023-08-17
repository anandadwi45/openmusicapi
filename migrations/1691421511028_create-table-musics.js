exports.up = pgm => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    title: {
      type: 'TEXT',
      notNull: true
    },
    year: {
      type: 'INT',
      notNull: true
    },
    genre: {
      type: 'TEXT',
      notNull: true
    },
    performer: {
      type: 'TEXT',
      notNull: true
    },
    duration: {
      type: 'FLOAT',
      notNull: false
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: false
    }
  })
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    name: {
      type: 'TEXT',
      notNull: true
    },
    year: {
      type: 'INT',
      notNull: true
    }
  })
}

exports.down = pgm => {
  pgm.dropTable('musics')
}
