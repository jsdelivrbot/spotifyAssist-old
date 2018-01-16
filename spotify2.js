const authCode = require('./authorization/authCode');

function test(req, res) {
  let authorization = req.header('Authorization');
  console.log(authorization);
  let token = authorization.split(' ')[1];
  if (authCode.verifyValidAccessToken(token)) {
    res.status(200).send('hi!');
  } else {
    res.status(400).send('bad auth!');
  }
}

exports.test = test;
