const config = require("../config");

const promp_request = () => {
    const params = {
        client_id: config.spotify_client_id,
        redirect_uri: config.spotify_redirect_url,
        response_type: "token",
        scope: "playlist-modify-private playlist-modify-public"
    }

    const urlParams = new URLSearchParams(params).toString();

    return `https://accounts.spotify.com/authorize?${urlParams}`;
}

module.exports = {
    promp_request
};

console.log(promp_request())