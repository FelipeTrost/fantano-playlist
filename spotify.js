const client_id = require("./config").spotify_client_id;

const promp_request = () => {
    const params = {
        client_id,
        response_type: "token",
        redirect_uri: "http://localhost:5000/spotify",
        scope: "playlist-modify-private"
    }

    const urlParams = new URLSearchParams(params).toString();

    return `https://accounts.spotify.com/authorize?${urlParams}`;
}

module.exports = {promp_request};

console.log(promp_request())