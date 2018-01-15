const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// Settings
const PORT = process.env.PORT || 5000;

// Local files
const spotify = require('./spotify.js');
//const oauth = require('./oauth.js');
const authRouter = require('./authorization/authRouter.js');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({extended: true}))
  .use('/auth', authRouter)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/login-spotify', (req, res) => res.redirect(spotify.authorizeURL))
  .get('/spotify-callback', (req, res) => spotify.processCallback(req, res))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
