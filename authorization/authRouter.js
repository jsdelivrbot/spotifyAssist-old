const {OAuth2Client} = require('google-auth-library');
const constants = require('../constants.js');
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  constants.GOOGLE_LOGIN_CALLBACK_URL,
);
const express = require('express');
const {URL} = require('url');
const db = require('../db.js');
const spotify = require('../spotify.js');
const authCode = require('./authCode.js');
const timestamp = require('unix-timestamp');
let router = express.Router();

// Use bodyParser to parse urlencoded post data.
router.get('/signin', signin);
router.post('/signin', signinPost);
router.get('/signinResult', signinResult);
router.post('/exchangeToken', exchangeToken);
router.get('/checkSpotify', checkSpotify);

exports.router = router;

function signin(req, res) {
  let hostName = req.hostname;
  let protocol = req.protocol;
  let port = constants.IS_DEV ? ':5000' : '';
  let redirectUrl = `${protocol}://${hostName}${port}/auth/signinResult`;
  let hrefUrl = `signin?client_id=google&redirect_uri=${redirectUrl}`;
  res.render('pages/signin', {redirectUrl: redirectUrl});
  // res.render('pages/signin');
}

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
    let authCodeToken =
      authCode.generateCodeToken(id, clientId, constants.AUTH_CODE);

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

function signinResult(req, res) {
  let codeToken = req.query.code;
  let state = req.query.state;
  res.render(
    'pages/signin_result',
    {
      authCodeToken: codeToken,
      state: state,
    });
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
function exchangeToken(req, res) {
  let clientId = req.body.client_id;
  let clientSecret = req.body.client_secret;
  let grantType = req.body.grant_type;
  // TODO: validate clientId && clientSecret pairing.
  let token = req.body.code ? req.body.code : req.body.refresh_token;
  console.log(`token: ${token}`);
  let verifiedToken = authCode.decryptCodeToken(token);
  let userId = verifiedToken.userId;
  let response = {};
  if (grantType === 'authorization_code') {
    // look for authorization code in db.
    // look up expiration date.
    let now = timestamp.now();
    let parsed = Date.parse(verifiedToken.expiresAt);
    console.log(`now: ${now}, parsed: ${parsed}, less than: ${now < parsed}`);
    let sameClientId = verifiedToken.clientId === clientId;
    let sameType = verifiedToken.type === constants.AUTH_CODE;
    let notExpired = Date.parse(verifiedToken.expiresAt) > timestamp.now();
    valid = sameClientId && sameType && notExpired;
    if (!valid) {
      return returnInvalidExchange(res);
    }
    let accessToken =
        authCode.generateCodeToken(userId, clientId, constants.ACCESS_TOKEN);
    let refreshToken =
        authCode.generateCodeToken(userId, clientId, constants.REFRESH_TOKEN);
    response = {
      token_type: 'bearer',
      access_token: accessToken.code,
      refresh_token: refreshToken.code,
      // TODO: refactor this.
      expires_in: 60*60,
    };
    res.json(response);
  } else if (grantType === 'refresh_token') {
    let sameClientId = verifiedToken.clientId === clientId;
    let sameType = verifiedToken.type === constants.REFRESH_TOKEN;
    valid = sameClientId && sameType;
    if (!valid) {
      return returnInvalidExchange(res);
    }
    let accessToken =
        authCode.generateCodeToken(userId, clientId, constants.ACCESS_TOKEN);
    response = {
      token_type: 'bearer',
      access_token: accessToken.code,
      // TODO: refactor this.
      expires_in: 60*60,
    };
  } else {
    return returnInvalidExchange(res);
  }
  res.json(response);
}

function returnInvalidExchange(res) {
  res.status(400).json({error: 'invalid_grant'});
}

exports.returnAuthCode = returnAuthCode;
