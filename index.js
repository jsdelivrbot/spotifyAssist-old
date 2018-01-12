const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const spotify = require('./spotify.js');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/login-spotify', (req, res) => res.redirect(spotify.authorizeURL))
  .get('/spotify-callback', (req, res) => res.render('pages/spotify', {name: 'Julian', email: 'a@google.com', authCode: req.query.code}))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
