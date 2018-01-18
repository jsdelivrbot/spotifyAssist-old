const authCode = require('./authorization/authCode');
const dialogFlow = require('actions-on-google').DialogflowApp;

const WELCOME_INTENT = 'input.welcome';  // the action name from the Dialogflow intent

function welcomeIntent (app) {
  app.tell('Welcome to Spotify Assist, hooray!');
}

const actionMap = new Map();
actionMap.set(WELCOME_INTENT, welcomeIntent);

function test(req, res) {
  // let authorization = req.header('Authorization');
  // console.log(authorization);
  // console.log(`req header: ${req.header()}`);
  console.log(`headers: ${JSON.stringify(req.headers)}`);
  console.log(`body: ${JSON.stringify(req.body)}`);
  const app = new dialogFlow({request: req, response: res});
  app.handleRequest(actionMap);
  // let token = authorization.split(' ')[1];
  // if (authCode.verifyValidAccessToken(token)) {
  //   res.status(200).send('hi!');
  // } else {
  //   res.status(400).send('bad auth!');
  // }
}

exports.test = test;
