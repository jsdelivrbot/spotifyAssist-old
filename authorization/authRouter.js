
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const express = require('express');
const constants = require('../constants.js');
const db = require('../db.js');
let router = express.Router();

// Use bodyParser to parse urlencoded post data.
router.get('/tokenExchange', grantToken);
router.get('/signIn', signIn);
router.get(
  '/google-callback', passport.authenticate('google', {}), checkSpotify);
router.get('/checkSpotify', checkSpotify);

module.exports = router;

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: constants.GOOGLE_LOGIN_CALLBACK_URL, // 'https://spotify-assist.herokuapp.com/auth/googleCallback',
  },
  async function(accessToken, refreshToken, profile, done) {
    let user = await db.findOrCreateUser(profile.id);
    console.log(user);
    done(null, user);
    /* .findOrCreate(
      {googleId: profile.id},
      function(err, user) {
      return done(err, user);
      }); */
  }
));

// Tell passport how to serialize / deserialize user.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

/**
 * Handle sign-in.
 * @param {http.ServerRequest} req: req
 * @param {http.ServerResponse} res: response to send.
 */
function signIn(req, res) {
  console.log(constants.GOOGLE_LOGIN_CALLBACK_URL);
  // redirect to have user sign in to Google.
  passport.authenticate(
    'google', {scope: ['https://www.googleapis.com/auth/userinfo.profile'], successRedirect: '/auth/checkSpotify',
    failureRedirect: '/login'})(req, res);
}

/**
 * Handle google callback after user signs into google.
 * @param {http.ServerRequest} req: req
 * @param {http.ServerResponse} res: response to send.
 */
function googleCallback(req, res) {
  passport.authenticate('google', {}, () => res.redirect('/auth/checkSpotify'))(req, res);
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
