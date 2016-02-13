const mongoose = require('mongoose'),
      Schema   = mongoose.Schema;

module.exports = new Schema({
    name:       String,
    author:     String,
    link:       String,
    thumbnail:  String,
    user:       String,
    skips:      Number,
    duration:   String,
    insertDate: {type: Date, default: Date.now}
});

