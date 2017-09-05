function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  var id_token = googleUser.getAuthResponse().id_token;

  // Grab query string params
  var searchParams = new URLSearchParams(window.location.search);
  var state = searchParams.get('state');
  var clientId = searchParams.get('client_id');
  var redirectUri = searchParams.get('redirect_uri');
  var expectedRedirectUri = 'https://oauth-redirect.googleusercontent.com/r/spotify-assist';
  if (clientId === 'google' /*&& redirectUri === expectedRedirectUri*/) {
    var form = $('<form></form>');
    form.attr('method', 'POST');
    form.attr('action', 'tokensignin');
    params = {'idtoken': id_token, 'state': state, 'redirectUri': redirectUri};
    redirectPost('tokensignin', params);
//    var xhr = new XMLHttpRequest();
//    xhr.open('POST', 'tokensignin');
//    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//    xhr.onload = function() {
//      console.log('Signed in as: ' + xhr.responseText);
//    };
//    var formParams = ['idtoken=' + id_token, 'state=' + state, 'redirectUri=' + redirectUri];
//    xhr.send(formParams.join('&'));
  }
}

function redirectPost(url, data) {
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    for (var name in data) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = data[name];
        form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}