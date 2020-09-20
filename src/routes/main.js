const express = require("express");
const router = express.Router();

const Track = require("../models/track_model");
const {
    promp_request
} = require('../utils/spotify');
var SpotifyWebApi = require('spotify-web-api-node');

const targetPlaylistName = "Fantano weekly roundup";

router.get('/start', (_, res) => {
    res.render("start.ejs", {
        link: promp_request()
    });
});

router.get('/spotify', async (req, res) => {
    res.render("spotify.ejs")
});

router.get('/create_playlist', async (req, res) => {
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
        res.json({
            success: true
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false
        })
    }
})

module.exports = router;