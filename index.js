const express = require('express');
const cors = require('cors');
const {promp_request} = require('./spotify');

const {fetchVideos, extractSongsFromList} = require('./youtube-utils');

(async () => {
    const videos = await fetchVideos(playlistId);
    const songs = extractSongsFromList(videos)
    console.log(songs.splice(0,20))
})()


// -------------------------------
// Setup express
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
  res.json({
    message: '🌈✨Hi from verter music✨🌈'
  });
});

app.get('/start', (_, res) => {
  res.end(`<a href="${promp_request()}">Start</a>`);
});

app.get('/spotify', (req, res) => {
    res.json(req);
});

// -------------------------------
// Run server

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
