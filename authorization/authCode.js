const jwt = require('jsonwebtoken');
const timestamp = require('unix-timestamp');
const crypto = require('crypto');
const randomBytes =
    require('bluebird').promisify(require('crypto').randomBytes);
const constants = require('../constants.js');
  

const TEN_MINUTES_IN_SECONDS = 10*60;
const ONE_HOUR_IN_SECONDS = 60*60;

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
  let expiresAt = null;
  if (type === constants.AUTH_CODE) {
    expiresAt = timestamp.toDate(timestamp.now(ONE_HOUR_IN_SECONDS));
  } else if (type === constants.ACCESS_TOKEN) {
    expiresAt = timestamp.toDate(timestamp.now(ONE_HOUR_IN_SECONDS));
  }
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

function decryptCodeToken(codeToken) {
  try {
    let verifiedToken = jwt.verify(codeToken, process.env.JWT_TOKEN_SECRET);
    return {
      code: codeToken,
      type: verifiedToken.type,
      userId: verifiedToken.userId,
      clientId: verifiedToken.clientId,
      expiresAt: verifiedToken.expiresAt,
    };
  } catch (err) {
    console.log(`err decrypting token: ${err}`);
    return err;
  }
}

exports.generateCodeToken = generateCodeToken;
exports.decryptCodeToken = decryptCodeToken;
