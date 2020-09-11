const SpotifyWebApi = require("spotify-web-api-node");
const config = require("./config");

const {
    fetchVideos,
    extractSongsFromList
} = require('./youtube-utils');

const YTplaylistId = "PLP4CSgl7K7or84AAhr7zlLNpghEnKWu2c";
const Track = require("./track_model");

const spotifyApi = new SpotifyWebApi({
    clientId: config.spotify_client_id,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri
});

spotifyApi.clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body.access_token))

module.exports = (async () => {
    console.log("Fetching song names");
    const videos = await fetchVideos(YTplaylistId);
    const songs = extractSongsFromList(videos);

    for (const name of songs) {
        const track = await Track.findOne({
            name
        });

        if (track) continue;

        const newTrack = new Track();
        newTrack.name = name;

        const search = await spotifyApi.searchTracks(name);
        const songMactches = search.body.tracks.items

        if (songMactches.length != 0) {
            newTrack.spotify_id = songMactches[0].id;
            newTrack.spotify = true;
        }

        await newTrack.save()
    }
    console.log("Done fetching");
})