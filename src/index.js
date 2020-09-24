const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const cors = require('cors');
const updateDB = require("./update_db");
const router = require("./routes/main");

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

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.json());

// -------------------------------
// Endpoints

app.use("/", router);

// -------------------------------
// Run server

const port = process.env.PORT || 5000;
app.listen(port, () => {
	/* eslint-disable no-console */
	console.log(`Listening: http://localhost:${port}`);
	/* eslint-enable no-console */
});