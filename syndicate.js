
var sc;
var host = 'wss://unht-beta.heahdk.net:10550/';
var secret = '1234567890'
function init_sockethub(host, secret){
    return SockethubClient.connect({
	'host' : host
    }).then(
	function(connection){
	    sc = connection;
	    sc.register({'secret':secret}).then(
		init_listeners, 
		function(e) {
		    console.log('failed_registering', e);
		} 
	    )
	}, 
	function(e){
	    console.log('failed_connecting', e)
	}
    )
}

function init_listeners(e) {
    console.log('succeed_registering', e)
    sc.on('message', function (data) {
	console.log('SH received message');
    });
    sc.on('error', function (data) {
	console.log('SH received error: ', data);
    });
    sc.on('response', function (data) {
	console.log('SH received response: ', data);
    });
    sc.on('close', function (data) {
	console.log('SH received close: ', data);
    });
}

var cfg = {
	username: 'noone_notmany',
	consumer_key: '3QeJdNd1DwUcGkRYCNGQ',
	consumer_secret: 'bfJD6ztBF2zvWFRUYVDTqggpqdD2zxKKzvN44qfLdp4',
	access_token: '1527612912-R2jfLkRbFawh0tT41LO5fFXi4RjtWfCPKr0yFnV'
	access_token_secret: 'RsDXzxoTGkwvCSl869lOWlruh18SqPhRfhoPI6h1aAA'
    }

function set_twitter_credentials(cfg){

    return sc.set('twitter', 
		  { credentials : { me : cfg } }/*{
	username: username,
	consumer_key: consumer_key,
	consumer_secret: consumer_secret,
	access_token: access_token,
	access_token_secret: access_token_secret*/
    ).then(function () {
	console.log('successfully set credentials for twitter account');
    }, function (err) {
	console.log('error setting credentials for twitter :( ', err);
    });
}

function syndicate_to_twitter(){
    return sc.submit({
	platform: 'twitter',
	verb: 'post',
	actor: { address: 'me' },
	object: {
	    text: 'Hello from the other side'
	},
	target : []
  }, 10000).then(function (response) {
    console.log('post sucessful, heres the response: ', response);
  }, function (err) {
    console.log('oh no! ', err);
  });
}


function actnow(){
    init_sockethub(host,secret).then(
	function(){
	    set_twitter_credentials(cfg).then(
		syndicate_to_twitter
	    )
	}
    )
}
