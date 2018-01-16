
const passport = require('passport');
const {OAuth2Client} = require('google-auth-library');
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  constants.GOOGLE_LOGIN_CALLBACK_URL,
);
const express = require('express');
const {URL} = require('url');
const constants = require('../constants.js');
const db = require('../db.js');
const spotify = require('../spotify.js');
const authCode = require('./authCode.js');
let router = express.Router();

// Use bodyParser to parse urlencoded post data.
router.get('/tokenExchange', grantToken);
router.get('/signIn', (req, res) => res.render('pages/signin'));
router.post('/signin', signinPost);
router.get(
  '/google-callback', passport.authenticate('google', {}), checkSpotify);
router.get('/checkSpotify', checkSpotify);

exports.router = router;

async function signinPost(req, res) {
  // Setup Google token verifier
  let idtoken = req.body.idtoken;
  let state = req.body.state;
  let redirectUrl = req.body.redirectUrl;
  let clientId = req.body.clientId;
  // Verify the id_token, and access the claims.
  try {
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: idtoken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    let id = ticket.payload.sub;
    console.log('id: ' + id);
    // fetch/create user.
    let user = await db.findOrCreateUser(id);
    let authCodeToken = authCode.generateCodeToken(id, clientId, 'AUTH_CODE');

    if (!user.spotify_access_token) {
      user.returnAuthCodeInfo = {
        token: authCodeToken,
        state: state,
        redirectUrl: redirectUrl,
      };
      req.user = user;
      spotify.loginSpotify(req, res);
    } else {
      // get ten minutes from now.
      // create new authorization
      returnAuthCode(authCodeToken, state, redirectUrl, res);
    }
    // if user does not have spotify credentials, redirect to spotify auth.
    // else return auth codes
  } catch (err) {
    console.log('Something went wrong!: ' + err);
  }
}

async function returnAuthCode(authCodeToken, state, redirectUrl, res) {
  // save authCodeToken
  await db.addOrUpdateCode(authCodeToken);
  // build redirect url
  let completeRedirectUrl = new URL(redirectUrl);
  completeRedirectUrl.searchParams.append('code', authCodeToken.code);
  completeRedirectUrl.searchParams.append('state', state);
  let redirect = completeRedirectUrl.href;
  console.log(redirect);
  res.redirect(redirect);
}

/**
 * Check if user has already logged into spotify, redirect if not.
 * @param {http.ServerRequest} req: req
 * @param {http.ServerResponse} res: response to send.
 */
function checkSpotify(req, res) {
  console.log('calling check spotify');
  let user = req.user;
  if (!user.spotify_access_token) {
    require('../spotify.js').loginSpotify(req, res);
  } else {
    res.render(
      'pages/spotify',
      {
        name: 'n/a',
        email: 'n/a',
        googleId: user.id,
        accessToken: user.spotify_access_token,
        accessExpire: user.spotify_access_token_expiration,
        refreshToken: user.spotify_refresh_token,
      });
  }
}

/**
 * Handle sign-in.
 * @param {http.ServerRequest} req: body contains client_id
 * @param {http.ServerResponse} res: response to send.
 */
function grantToken(req, res) {

}

exports.returnAuthCode = returnAuthCode;