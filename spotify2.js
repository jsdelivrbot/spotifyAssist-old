require('./authorization/authCode');

function test(req, res) {
  let authorization = req.header('Authorization');
  console.log(authorization);
  res.status(200).send('hi!');
}

exports.test = test;
