const {Client} = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

client.connect();
console.log('connected to db');
findOrCreateUser(1234).then((user) => console.log('test user: ' + user));
/**
 * run a given query
 * @param {*} query
 * @param {*} methodName
 * @return {object} null if query failed
 */
async function runQuery(query, methodName) {
  try {
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
    user = addUser(userId);
  }
  console.log('user: ' + user);
  return user;
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

exports.checkUserExists = checkUserExists;
exports.addUser = addUser;
exports.findOrCreateUser = findOrCreateUser;
/*
client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});
*/
