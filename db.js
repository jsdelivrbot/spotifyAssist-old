
const {Client} = require('pg');
const constants = require('./constants.js');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: !constants.IS_DEV,
});

client.connect();
console.log('connected to db');

/**
 * run a given query
 * @param {*} query
 * @param {*} methodName
 * @return {object} null if query failed
 */
async function runQuery(query, methodName) {
  try {
    console.log('running query for ' + methodName);
    return (await client.query(query));
  } catch (err) {
    console.log(
      `Query failed for method ${methodName}! Query: ${query}, err: ${err}`);
    return null;
  }
}

/**
 * Returns the user. Creates new one if it doesn't exist.
 * @param {int} userId
 * @return {User}
 */
async function findOrCreateUser(userId) {
  let user = await checkUserExists(userId);
  if (!user) {
    console.log('user did not exist, creating');
    await addUser(userId);
    user = await checkUserExists(userId);
  }
  console.log('user: ' + user);
  return user;
}

/**
 * Check whether user exists
 * @param {string} userId
 * @param {string} accessToken
 * @param {string} accessExpiration
 * @param {string} refreshToken
 */
async function updateUser(userId, accessToken, accessExpiration, refreshToken) {
  let query = {
    text: `UPDATE users
    SET spotify_access_token = $2,
        spotify_access_token_expiration = $3,
        spotify_refresh_token = $4 
    WHERE id = $1;`,
    values: [userId, accessToken, accessExpiration, refreshToken],
  };

  let result = await runQuery(query, 'updateUser');
  console.log(result);
}

/**
 * Check whether user exists
 * @param {int} userId
 * @return {bool}
 */
async function checkUserExists(userId) {
  let query = {
    text: 'SELECT * FROM users WHERE id = $1',
    values: [userId],
  };

  let result = await runQuery(query, 'checkUserExists');
  return result && result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Add a user.
 * @param {int} userId
 */
async function addUser(userId) {
  let query = {
    text: 'INSERT INTO users (id) VALUES ($1)',
    values: [userId],
  };
  let result = await runQuery(query, 'addUser');
  console.log(result);
}

/**
 * Will add or update the given codeToken. Update will overwrite.
 * @param {*} codeToken 
 * @return {bool} whether the code already existed.
 */
async function addOrUpdateCode(codeToken) {
  let existingToken = await lookupCodeByKey(codeToken);
  if (!existingToken) {
    console.log(`codeToken of type ${codeToken.type} for user ${codeToken.userId} 
      and clientId ${codeToken.clientId} did not exist, creating`);
    await addCode(codeToken);
    return true;
  } else {
    let query = {
      text: `UPDATE authorizations 
        SET code = $1,
            expires_at = $2
        WHERE code_type = $3 and user_id = $4 and client_id = $5;`,
      values: [
        codeToken.code,
        codeToken.expiresAt,
        codeToken.type,
        codeToken.userId,
        codeToken.clientId],
    };
    let result = await runQuery(query, 'addOrUpdateCode.update');
    console.log(result);
    return false;
  }
}

async function lookupCodeByKey(codeToken) {
  let query = {
    text: `SELECT * FROM authorizations WHERE code_type = $1 and user_id = $2 
      and client_id = $3`,
    values: [codeToken.type, codeToken.userId, codeToken.clientId],
  };
  let result = await runQuery(query, 'lookupCodeByKey');
  return result && result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Add a code.
 * @param {codeToken} codeToken
 */
async function addCode(codeToken) {
  let query = {
    text:
      `INSERT INTO authorizations (code, code_type, user_id, client_id, expires_at) 
       VALUES ($1, $2, $3, $4, $5)`,
    values: [
      codeToken.code,
      codeToken.type,
      codeToken.userId,
      codeToken.clientId,
      codeToken.expiresAt,
    ],
  };
  let result = await runQuery(query, 'addCode');
  console.log(result);
}

async function lookupCode(code) {
  let query = {
    text: 'SELECT * FROM authorizations WHERE code = $1',
    values: [code],
  };
  let result = await runQuery(query);
  return result && result.rows.length > 0 ? result.rows[0] : null;
}

exports.checkUserExists = checkUserExists;
exports.addUser = addUser;
exports.findOrCreateUser = findOrCreateUser;
exports.updateUser = updateUser;
exports.addCode = addCode;
exports.addOrUpdateCode = addOrUpdateCode;
exports.lookupCode = lookupCode;
/*
client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});
*/
