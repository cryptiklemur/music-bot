const mongoose = require('mongoose'),
      Song     = require('./Song');


Song.add({request: {type: Boolean, default: true}});
module.exports = mongoose.model('Request', Song, 'requests');
