const mongoose = require('mongoose');

const trackSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    spotify_id: {
        type: String,
    }
});

module.exports = mongoose.model('Tracks', trackSchema);