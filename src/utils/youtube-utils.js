const got = require('got');

const key = require("../config").youtube_key;

// Fetch video snippets from a youtube playlist
const fetchVideos = async uid => {
    let pageToken = "";
    const videos = [];

    try {
        do {
            const response = await got(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uid}&key=${key}&pageToken=${pageToken}`, {
                    responseType: 'json'
                }
            );

            videos.push(...response.body["items"]);

            if (response.body["nextPageToken"])
                pageToken = response.body["nextPageToken"]
            else
                pageToken = false

        } while (pageToken);
    } catch (error) {
        console.error(error);
    }

    return videos
}

// Get songs from description
const extractSongs = video => {
    const videoDescription = video.snippet.description;
    const segment = videoDescription.toLowerCase().match(/!!(fav|best).*\n[\s\S]*meh/);

    if (!segment) return []

    const songTitles = []
    const songMatches = segment[0].match(/.*\nhttp/g)

    for (const match of songMatches)
        songTitles.push(match.substr(0, match.length - 5))

    return songTitles
}

// extract description from video list
const extractSongsFromList = list => {
    const songs = [];
    for (let video of list)
        songs.push(...extractSongs(video))

    return songs
}

module.exports = {
    fetchVideos,
    extractSongs,
    extractSongsFromList
}