const got = require('got');

const key = require("./config").youtube_key;

// Fetch video snippets from a youtube playlist
const fetchVideos = async uid => {
    let pageToken = "";
    const videos = [];

    try {
        do {
            const response = await got(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uid}&key=${key}&pageToken=${pageToken}`,
                {
                    responseType: 'json'
                }
            );
    
            videos.push(...response.body["items"]);
    
            if(response.body["nextPageToken"])
                pageToken = response.body["nextPageToken"]
            else
                pageToken = false

        } while (pageToken);
    } catch (error) {
        console.error(error);
    }
    
    return videos
}

module.exports = {fetchVideos, extractSongs, extractSongsFromList}