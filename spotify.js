let SpotifyWebApi = require('spotify-web-api-node');
let scopes = ['user-read-private', 'user-read-email'];
let redirectUri = 'ENV' in process.env
        ? 'http://localhost:5000/spotify-callback'
        : 'https://spotify-assist.herokuapp.com/spotify-callback';
let clientId = process.env.SPOTIFY_CLIENT_ID;
let clientSecret = process.env.SPOTIFY_SECRET;
let state = 'some-state-of-my-choice';

// Setting credentials can be done in the wrapper's constructor, or using the
// API object's setters.
let spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
  clientSecret: clientSecret,
});

// Create the authorization URL
let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, true);

exports.authorizeURL = authorizeURL;
// https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
console.log(authorizeURL);

/**
 * Fetches access token from Spotify API.
 * @param {string} code: the authorization code to use
 * @param {function} callback: callback when finishing retrieving token.
 * */
function retrieveToken(code, callback) {
  spotifyApi.authorizationCodeGrant(code)
    .then(function(data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
      callback();
    }, function(err) {
      console.log('Something went wrong with retrieveToken()!', err);
      spotifyApi.setAccessToken(process.env.SPOTIFY_ACCESS_TOKEN);
      callback();
    });
}

/**
 * Fetches "me" from SpotifyApi and renders the page in response.
 * @param {http.ServerResponse} res: response to render.
 * @param {string} code: authCode used to fetch token.
 */
async function fetchMeAndRender(res, code) {
    let me = 'blagh';
    console.log('getAccessToken: ' + spotifyApi.getAccessToken());
    try {
      me = (await spotifyApi.getMe()).body;
    } catch (err) {
      console.log('Something went wrong with getMe()!', err);
    }
    console.log('Some information about the authenticated user', me);
    res.render(
      'pages/spotify',
      {name: me.display_name, email: me.email, authCode: code});
  }

/**
 * Setup Spotify WebApi.
 * @param {http.ServerRequest} req: server request
 * @param {http.ServerResponse} res: server response
 */
async function processCallback(req, res) {
  // var code = 'query' in req ? req.query.code : '';
  // code = process.env.SPOTIFY_TOKEN;
  //  'SPOTIFY_TOKEN' in process.env ? process.env.SPOTIFY_TOKEN :
  var code = req.query.code;
  console.log(code);
  console.log('retrieving token')
  retrieveToken(code, () => fetchMeAndRender(res, code));
}

exports.processCallback = processCallback;
