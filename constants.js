// const toSnake = require('to-snake-case');

// const constants = {
//   spotifyLoginCallback: 'spotify-callback',
//   googleLoginCallback: 'google-callback',
// };
// 
// for (let constantName in constants) {
//   exports[toSnake(constantName)]
// }
const isDev = 'ENV' in process.env;
const domain = isDev
    ? 'http://localhost:5000/'
    : 'https://spotify-assist.herokuapp.com/';
    
/**
 * Appends the route to the domain.
 * @param {string} route
 * @return {string} url
 */
function generateUrl(route) {
  return `${domain}${route}`;
}

const spotifyLoginCallback = 'spotify-callback';
const spotifyLoginCallbackUrl = generateUrl(spotifyLoginCallback);
const googleLoginCallback = 'auth/google-callback';
const googleLoginCallbackUrl = generateUrl(googleLoginCallback);

exports.generateUrl = generateUrl;
exports.SPOTIFY_LOGIN_CALLBACK_URL = spotifyLoginCallbackUrl;
exports.GOOGLE_LOGIN_CALLBACK_URL = googleLoginCallbackUrl;
exports.IS_DEV = isDev;
exports.AUTH_CODE = 'AUTH_CODE';
exports.ACCESS_TOKEN = 'ACCESS_TOKEN';
exports.REFRESH_TOKEN = 'REFRESH_TOKEN';