// director.js
// by Michal Novemsky

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var DirectorSchema   = new Schema({
    livestream_id: {type: Number, unique: true}, //the Livestream ID should be unique
    full_name: String,
    dob: Date,
    favorite_camera: String,
    favorite_movies: [String]
});

module.exports = mongoose.model('Director', DirectorSchema);

