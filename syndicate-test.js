sh = {
  "host": "localhost",
  "ssl": false,
  "port": 10550,
  "register": {
    "secret": "1234567890"
  }
}

twitter = {
  "username": "noone_notmany",
  "consumer_key": "3QeJdNd1DwUcGkRYCNGQ",
  "consumer_secret": "bfJD6ztBF2zvWFRUYVDTqggpqdD2zxKKzvN44qfLdp4",
  "access_token": "1527612912-R2jfLkRbFawh0tT41LO5fFXi4RjtWfCPKr0yFnV",
  "access_token_secret": "RsDXzxoTGkwvCSl869lOWlruh18SqPhRfhoPI6h1aAA",
}


var sockethubClient = SockethubClient.connect('ws://localhost:10550/sockethub', {
  register: { 
    secret: '1234567890' 
  }
});
sockethubClient.on('message', function(response) {
  console.log('message!', response);
});
sockethubClient.on('registration-failed', function(response) {
  console.log('not registered!');
  alert(response);
});
sockethubClient.on('registered', function() {
  console.log('registered!');
  sockethubClient.set('twitter', {credentials: {me: twitter
  }}).then(function() {
    sockethubClient.sendObject({
      platform: 'twitter',
      verb: 'fetch',
      actor: {address: 'me'},
      target: {}
    }).then(function (response) {
      console.log('post sucessful, heres the response: ', response);
    }, function (err) {
      console.log('oh no! ', err);
    }, function(err) {
      alert(err);
    });
  });
});
