const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const cors = require('cors');
const updateDB = require("./update_db");
const {
	promp_request
} = require('./spotify');
var SpotifyWebApi = require('spotify-web-api-node');

const targetPlaylistName = "Fantano weekly roundup";

// -------------------------------
// Connect to mongodb
mongoose.connect(config.mongoose_db, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

// -------------------------------
// Update DB periodically
updateDB() // run on start
setTimeout(updateDB, 1000 * 60 * 60 * 24) //run once per day

// -------------------------------
// Setup express
const app = express();

app.use(cors());
app.use(express.json());

// -------------------------------
// Endpoints
app.get('/', (_, res) => {
	res.json({
		message: '🌈✨Hi from verter music✨🌈'
	});
});

app.get('/start', (_, res) => {
	res.end(`<a href="${promp_request()}">Start</a>`);
});

app.get('/spotify', async (req, res) => {
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

		//This songs are only for testing purposes
		await spotifyApi.addTracksToPlaylist(targetPlaylistId, ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"]);
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

// -------------------------------
// Run server

const port = process.env.PORT || 5000;
app.listen(port, () => {
	/* eslint-disable no-console */
	console.log(`Listening: http://localhost:${port}`);
	/* eslint-enable no-console */
});