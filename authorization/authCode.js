const jwt = require('jsonwebtoken');
const timestamp = require('unix-timestamp');
const crypto = require('crypto');
const randomBytes =
    require('bluebird').promisify(require('crypto').randomBytes);
  

const TEN_MINUTES_IN_SECONDS = 10*60;

function generateRandomToken() {
  return randomBytes(256).then(function(buffer) {
    return crypto
      .createHash('sha1')
      .update(buffer)
      .digest('hex');
  });
}

/**
 * 
 * @param {string} userId 
 * @param {string} clientId 
 * @param {string} type either AUTH_CODE or
 * @return {object}
 */
function generateCodeToken(userId, clientId, type) {
  let expiresAt = timestamp.toDate(timestamp.now(TEN_MINUTES_IN_SECONDS));
  let token = jwt.sign(
    {
      type: type,
      userId: userId,
      clientId: clientId,
      expiresAt: expiresAt,
    },
    process.env.JWT_TOKEN_SECRET);
  return {
    code: token,
    type: type,
    userId: userId,
    clientId: clientId,
    expiresAt: expiresAt,
  };
}

exports.generateCodeToken = generateCodeToken;
