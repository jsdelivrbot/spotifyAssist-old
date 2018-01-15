$(document).ready();

/**
 * signIn and send Google credential to server.
 * @param {string} googleUser: googleUser credential.
 */
function onSignIn(googleUser) {
  let profile = googleUser.getBasicProfile();
  // Do not send to your backend! Use an ID token instead.
  console.log('ID: ' + profile.getId());
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  // This is null if the 'email' scope is not present.
  console.log('Email: ' + profile.getEmail());
  let idToken = googleUser.getAuthResponse().id_token;

  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'oauth/tokensignin');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function() {
    console.log('Signed in as: ' + xhr.responseText);
  };
  xhr.send('idtoken=' + idToken);
}

/**
 * Sign out of Google account.
 */
function signOut() {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {
        console.log('User signed out.');
    });
}
