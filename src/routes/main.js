const express = require("express");
const router = express.Router();

const Track = require("../models/track_model");
const {
    promp_request
} = require('../utils/spotify');
var SpotifyWebApi = require('spotify-web-api-node');

const targetPlaylistName = "Fantano weekly roundup";

router.get('/start', (_, res) => {
    res.end(`<a href="${promp_request()}">Start</a>`);
});

router.get('/spotify', async (req, res) => {
    let success = true;
    try {
        const token = req.query.token;

        if (!token) throw new Error("Request doesn't contain a token");

        // credentials are optional
        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(token);

        const users_playlists = await spotifyApi.getUserPlaylists();
        const existingFantanoPlaylist = users_playlists.body.items.find(playlist => playlist.name == targetPlaylistName);

        let targetPlaylistId;

        if (existingFantanoPlaylist)
            targetPlaylistId = existingFantanoPlaylist.id
        else {
            const user_info = await spotifyApi.getMe();
            const username = user_info.body.display_name;

            const playlist = await spotifyApi.createPlaylist(username, targetPlaylistName);
            targetPlaylistId = playlist.body.id
        }

        const fantanoTracks = await Track.find({
            spotify: true
        })

        const fantanoTracksUris = fantanoTracks.map(track => "spotify:track:" + track.spotify_id)

        //We can only put 100 songs at a time
        for (let i = 0; i < Math.ceil(fantanoTracksUris.length / 100); i++) {
            await spotifyApi.addTracksToPlaylist(targetPlaylistId, Array(...fantanoTracksUris).splice(0, 100));
        }
    } catch (error) {
        console.log(error);
        success = false;
    }

    //The js code is to put the token in the GET parameters, before that you couldn't access the token (Because it was ment for frontend)
    res.end(
        "<script> const token = window.location.hash.substr(1).split('&')[0].split('=')[1]; if(token) window.location.href= window.location.origin + '/spotify?token=' + token </script>" +
        (success ? "<h1>Success</h1>" : "<h1>Failure</h1>")
    );
});

module.exports = router;