const express = require("express");
const router = express.Router();

const Track = require("../models/track_model");
const {
    promp_request
} = require('../utils/spotify');
var SpotifyWebApi = require('spotify-web-api-node');

const targetPlaylistName = "Fantano weekly roundup";

router.get('/', (_, res) => {
    res.render("index.ejs", {
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
        let targetPlaylistUrl;


        if (existingFantanoPlaylist) {
            targetPlaylistId = existingFantanoPlaylist.id
            targetPlaylistUrl = existingFantanoPlaylist.external_urls.spotify
        } else {
            const user_info = await spotifyApi.getMe();
            const username = user_info.body.display_name;

            const playlist = await spotifyApi.createPlaylist(username, targetPlaylistName);
            targetPlaylistId = playlist.body.id
            targetPlaylistUrl = playlist.body.external_urls.spotify
        }

        console.log(existingFantanoPlaylist)
        const fantanoTracks = await Track.find({
            spotify: true
        })
        const fantanoTracksUris = fantanoTracks.map(track => "spotify:track:" + track.spotify_id)


        //First we call replace, this replaces all the tracks in the playlist with the ones we are giving it
        //this way, if someone is adding the playlist for a second time, he doesn't get duplicates
        await spotifyApi.replaceTracksInPlaylist(targetPlaylistId, fantanoTracksUris.splice(0, 100));


        //We can only put 100 songs at a time
        const executions = Math.ceil(fantanoTracksUris.length / 100)
        for (let i = 0; i < executions; i++) {
            await spotifyApi.addTracksToPlaylist(targetPlaylistId, fantanoTracksUris.splice(0, 100));
        }
        res.json({
            success: true,
            targetPlaylistUrl
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false
        })
    }
})

module.exports = router;