const mapDBToModelAlbums = ({
  id,
  name,
  year
}) => ({
  id,
  name,
  year
})

const mapDBToModelMusics = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId
})

const mapDBToModelPlaylists = ({
  id,
  name,
  owner
}) => ({
  id,
  name,
  owner
})

module.exports = { mapDBToModelAlbums, mapDBToModelMusics, mapDBToModelPlaylists }
