const mongoose = require('mongoose'),
      Schema   = mongoose.Schema,
      Song     = require('./Song');

const Playlist = new Schema({
    name:       {type: String, index: {unique: true}},
    songs:      [Song],
    user:       String,
    insertDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Playlist', Playlist, 'playlists');

