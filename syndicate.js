
var sockethubClient;

function init_sockethub(cfg){
    var sockethubClient = SockethubClient.connect(cfg);
    setInterval(fetch_tweets, 10000); // I hope I won't have to intervall this later
    return sockethubClient
}

function process_twitter_message(message){
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

function process_response(message) {
    console.log('SH received message', message);
    if(message.platform == 'twitter')
	process_twitter_message(message);
    
}

function sockethub_eventlisteners(sockethubClient){
    sockethubClient.on('message', process_response);
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

var twitter_cfg
function set_twitter_credentials(cfg){

    return sockethubClient.set('twitter', 
		  { credentials : { me : cfg } }
    ).then(function (resp) {
	console.log('successfully set credentials for twitter account', resp);
    }, function (err) {
	console.log('error setting credentials for twitter :( ', err);
    });
}

function syndicate_to_twitter(post){
    console.log("this will be sent : ",	{
	    platform: 'twitter',
	    verb: 'post',
	    actor: { address: 'me' },
	    object: {
		text: post.text
	    },
	   target : [{ address : 'a@b.c'}]
	}
)
    return sockethubClient.sendObject(
	{
	    platform: 'twitter',
	    verb: 'post',
	    actor: { address: 'me' },
	    object: {
		text: post.text
	    },
	    target : [{ address : 'a@b.c'}]
	}
    ).then(function (response) {
    console.log('post sucessful, heres the response: ', response);
  }, function (err) {
    console.log('oh no! ', err);
  });
}

function fetch_tweets(target)
{
    if(!target)
	target = 'user'
    console.log({
	platform : 'twitter',
	verb : 'fetch',
	actor : { address : 'me' },
	//target : [ { address : target }]
    })
    return sockethubClient.sendObject({
	platform : 'twitter',
	verb : 'fetch',
	actor : { address : 'me' },
	target : [ { address : target }]
    }).then(function(response) {
	console.log('Here\'s the response of fetch : ',response)
    }, function(e){
	console.log('oh noooo!', e)
    })
}

function actnow(){
    remoteStorage.sockethubcredentials.get('profile-sockethub').then(
	function(cfg){
	    sockethubClient = init_sockethub(cfg);
	    sockethubClient.on('registered', function(resp){
		remoteStorage.twittercredentials.get('profile-twitter').then(
		    function(cfg){
			set_twitter_credentials(cfg);    
		    }
		)
	    })
	    sockethub_eventlisteners(sockethubClient);
	}
    )
}
