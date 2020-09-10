const {
    fetchVideos,
    extractSongsFromList
} = require('./youtube-utils');

const YTplaylistId = "PLP4CSgl7K7or84AAhr7zlLNpghEnKWu2c";
const Track = require("./track_model");

module.exports = (async () => {
    console.log("Fetching song names");
    const videos = await fetchVideos(YTplaylistId);
    const songs = extractSongsFromList(videos);

    for (const name of songs) {
        const track = await Track.findOne({
            name
        });

        if (!track) {
            const newTrack = new Track();
            newTrack.name = name;
            await newTrack.save()
        }
    }
    console.log("Done fetching");
})