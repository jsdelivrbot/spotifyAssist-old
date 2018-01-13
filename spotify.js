var SpotifyWebApi = require('spotify-web-api-node');

var scopes = ['user-read-private', 'user-read-email'],
    //redirectUri = 'localhost:5000/spotify-callback',
    redirectUri = 'https://spotify-assist.herokuapp.com/spotify-callback',
    clientId = process.env.SPOTIFY_CLIENT_ID,
    clientSecret = process.env.SPOTIFY_SECRET,
    state = 'some-state-of-my-choice';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
  redirectUri : redirectUri,
  clientId : clientId,
  clientSecret : clientSecret
});

// Create the authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, true);

exports.authorizeURL = authorizeURL;
// https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
console.log(authorizeURL);

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
    });
}

async function processCallback(req, res) {
  //var code = 'query' in req ? req.query.code : '';
  //code = process.env.SPOTIFY_TOKEN;
  var code = 'SPOTIFY_TOKEN' in process.env ? process.env.SPOTIFY_TOKEN : req.query.code;
  console.log(code);
  console.log('retrieving token')
  retrieveToken(code, async function() {
    // try to access stuff
    var me = 'blagh';
    console.log('getAccessToken: ' + spotifyApi.getAccessToken());
    try {
      me = await spotifyApi.getMe();
    } catch (err) {
      console.log('Something went wrong with getMe()!', err);
    }
    console.log('Some information about the authenticated user', data.body);
    res.render('pages/spotify', {name: me.display_name, email: me.email, authCode: code});
    //spotifyApi.getMe()
    //    .then(function(data) {
    //      me = data.body;
    //      console.log('Some information about the authenticated user', data.body);
    //      res.render('pages/spotify', {name: me.display_name, email: me.email, authCode: code});
    //    }, function(err) {
    //      console.log('Something went wrong with getMe()!', err);
    //    });
  });
}

exports.processCallback = processCallback
exports.retrieveToken = retrieveToken
