const SpotifyWebApi = require('spotify-web-api-node');
const constants = require('./constants.js');
const jwt = require('jsonwebtoken');
const db = require('./db.js');
const authRouter = require('./authorization/authRouter.js');
const timestamp = require('unix-timestamp');
let scopes = ['user-read-private', 'user-read-email'];
let redirectUri = constants.SPOTIFY_LOGIN_CALLBACK_URL;
let clientId = process.env.SPOTIFY_CLIENT_ID;
let clientSecret = process.env.SPOTIFY_SECRET;

// Setting credentials can be done in the wrapper's constructor, or using the
// API object's setters.
let spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
  clientSecret: clientSecret,
});

/**
 * Takes in a string userId and initializes a new SpotifyWebApi instance for
 * accessing Spotify Web api using the userId access and refresh tokens.
 * @param {string} userId 
 */
function initSpotifyApi(userId) {

}


/**
 * Redirect to spotify login.
 * @param {http.ServerRequest} req: req
 * @param {http.ServerResponse} res: response to send.
 */
function loginSpotify(req, res) {
  let id = req.user.id;
  let token = jwt.sign({id: id, user: req.user}, process.env.JWT_TOKEN_SECRET);
  console.log(`token: ${token}`);
  // Create the authorization URL
  let authorizeURL = spotifyApi.createAuthorizeURL(scopes, token, true);
  res.redirect(authorizeURL);
}

exports.loginSpotify = loginSpotify;
// https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
// console.log(authorizeURL);

/**
 * Fetches access token from Spotify API.
 * @param {string} code: the authorization code to use
 * @param {string} id
 * @return {user}
 * */
async function retrieveToken(code) {
  try {
    let data = await spotifyApi.authorizationCodeGrant(code);
    let accessToken = data.body['access_token'];
    let accessExpirationIn = data.body['expires_in'];
    let refreshToken = data.body['refresh_token'];
    console.log('The token expires in ' + accessExpirationIn);
    console.log('The access token is ' + accessToken);
    console.log('The refresh token is ' + refreshToken);

    // Set the access token on the API object to use it in later calls
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);

    // convert time
    let accessExpirationDate =
        timestamp.toDate(timestamp.now(accessExpirationIn));
    console.log(accessExpirationDate);
    // save spotify token && expiration here.
    let user = {
      spotify_access_token: accessToken,
      spotify_access_token_expiration: accessExpirationDate,
      spotify_refresh_token: refreshToken,
    };
    return user;
  } catch (err) {
      console.log('Something went wrong with retrieveToken()!', err);
      spotifyApi.setAccessToken(process.env.SPOTIFY_ACCESS_TOKEN);
      return null;
  }
}

/**
 * Fetches "me" from SpotifyApi and renders the page in response.
 * @param {http.ServerResponse} res: response to render.
 * @param {User} user: authCode used to fetch token.
 */
async function fetchMeAndRender(res, user) {
    let me = 'blagh';
    console.log('getAccessToken: ' + spotifyApi.getAccessToken());
    try {
      // save the user.
      console.log(user.id);
      await db.updateUser(
        user.id,
        user.spotify_access_token,
        user.spotify_access_token_expiration,
        user.spotify_refresh_token);
      me = (await spotifyApi.getMe()).body;
    } catch (err) {
      console.log('Something went wrong with getMe()!', err);
    }
    console.log('Some information about the authenticated user', me);
    res.render(
      'pages/spotify',
      {
        name: me.display_name,
        email: me.email,
        googleId: user.id,
        accessToken: user.spotify_access_token,
        accessExpire: user.spotify_access_token_expiration,
        refreshToken: user.spotify_refresh_token,
      });
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
  let code = req.query.code;
  let token = req.query.state;
  let verifiedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
  let id = verifiedToken.id;
  let authCodeInfo = verifiedToken.user.returnAuthCodeInfo;
  console.log(code);
  console.log('retrieving token');
  let user = await retrieveToken(code);
  user.id = id;
  await db.updateUser(
    user.id,
    user.spotify_access_token,
    user.spotify_access_token_expiration,
    user.spotify_refresh_token);
  me = (await spotifyApi.getMe()).body;
  console.log('Some information about the authenticated user: ', me);
  authRouter.returnAuthCode(
    authCodeInfo.token, authCodeInfo.state, authCodeInfo.redirectUrl, res);
}

exports.processCallback = processCallback;
