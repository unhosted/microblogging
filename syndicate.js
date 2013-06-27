
var sockethubClient;

function init_sockethub(cfg){
    var sockethubClient = SockethubClient.connect(cfg);
    return sockethubClient
}

function process_response(message) {
        console.log('SH received message', message);
	if(message.verb == 'post'){
	    var data = {
		screenname : message.actor.address,
		fullname : message.actor.name,
		text : message.object.text,
		date : message.object.created_at, //maybe turn it into timestamp here
		avatar : message.actor.image,
		post_id : "twitter_"+message.object.id
	    }
	    console.log('reciving post via fetch : ', data);
	    process_post(data);
	}
    }

function sockethub_eventlisteners(sockethubClient){
    sockethubClient.on('message', process_response);

    remoteStorage.twittercredentials.get('profile-twitter').then(
	function(cfg){
	    set_twitter_credentials(cfg);    
	}
    )
}    

// function init_listeners(e) {
//     console.log('succeed_registering', e)
//     sc.on('message', function (data) {
// 	console.log('SH received message');
//     });
//     sc.on('error', function (data) {
// 	console.log('SH received error: ', data);
//     });
//     sc.on('response', function (data) {
// 	console.log('SH received response: ', data);
//     });
//     sc.on('close', function (data) {
// 	console.log('SH received close: ', data);
//     });
// }

var twitter_cfg /*= {
	username: 'noone_notmany',
	consumer_key: '3QeJdNd1DwUcGkRYCNGQ',
	consumer_secret: 'bfJD6ztBF2zvWFRUYVDTqggpqdD2zxKKzvN44qfLdp4',
	access_token: '1527612912-R2jfLkRbFawh0tT41LO5fFXi4RjtWfCPKr0yFnV',
	access_token_secret: 'RsDXzxoTGkwvCSl869lOWlruh18SqPhRfhoPI6h1aAA'
    }
*/
function set_twitter_credentials(cfg){

    return sockethubClient.set('twitter', 
		  { credentials : { me : cfg } }
    ).then(function () {
	console.log('successfully set credentials for twitter account');
    }, function (err) {
	console.log('error setting credentials for twitter :( ', err);
    });
}

function syndicate_to_twitter(){
    return sockethubClient.sendObject({
	platform: 'twitter',
	verb: 'post',
	actor: { address: 'me' },
	object: {
	    text: 'Hello from the other side'
	},
	target : []
  }).then(function (response) {
    console.log('post sucessful, heres the response: ', response);
  }, function (err) {
    console.log('oh no! ', err);
  });
}

function fetch_tweets(target)
{
    if(!target)
	target = 'user'
    return sockethubClient.sendObject({
	platform : 'twitter',
	verb : 'fetch',
	actor : { address : 'me' },
	target : [target]
    }).then(function(response) {
	console.log('Here\'s the response of fetch : ',response)
    }, function(e){
	console.log('oh noooo!', e)
    })
}

function actnow(){
    remoteStorage.sockethubcredentials.get('profile-sockethub').then(
	function(cfg){
	    sockethubClient = init_sockethub(cfg)
	    sockethubClient.on('registered', 
			       function(){
				   remoteStorage.twittercredentials.get('profile-twitter').then(
				       function(twitter_cfg){
					   set_twitter_credentials(twitter_cfg).then(
					       fetch_feeds
					   )
				       }
				   )
			       }
			      )
	}
    )
}
