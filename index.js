const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const ensureLogin = require('connect-ensure-login');
// Settings
const PORT = process.env.PORT || 5000;

// Local files
const spotify = require('./spotify.js');
const spotify2 = require('./spotify2.js');
//const oauth = require('./oauth.js');
const authRouter = require('./authorization/authRouter.js');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.json({type: 'application/json'}))
  .use('/auth', authRouter.router)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/webhook', spotify2.test)
  .get(
    '/login-spotify',
    spotify.loginSpotify)
  .get('/spotify-callback', (req, res) => spotify.processCallback(req, res))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
