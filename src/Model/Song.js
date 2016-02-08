const mongoose = require('mongoose'),
      Schema   = mongoose.Schema;

module.exports = new Schema({
    name:       String,
    author:     String,
    link:       {type: String, index: {unique: true}},
    thumbnail:  String,
    user:       String,
    skips:      Number,
    duration:   String,
    ratings:    [{user: String, like: Boolean}],
    insertDate: {type: Date, default: Date.now}
});

