
var sockethubClient;
var retryTimeout;
function init_sockethub(cfg){
  clearInterval(retryTimeout);
  var sc;
  console.log('registering at sockethub',cfg)
  function register(){
    sc = SockethubClient.connect(cfg);
  }

  retryTimeout = setInterval(register, 10000);
  register();

  sc.on('registered', function(resp){
    console.log('socketHub registration done!')
    clearInterval(retryTimeout);
    
    remove_class(sockethub_widget,'offline');
    remove_class(sockethub_widget, 'expanded');
    sockethubClient = sc;
  })
  sc.on('registration-failed', function(resp){
    console.error('socketHub registration failed', resp)
  })
  options.syndicate = 'true'
  push_state(options);
  return sc;
}
var update_timeout

function process_twitter_message(message){
  if(message.verb == 'post'){
	var data = {
	    screenname : message.actor.address,
	    fullname : message.actor.name,
	    text : message.object.text,
	    date : ( new Date(message.object.date) ).getTime(), 
	    avatar : message.actor.image,
	    twitter_id : message.object.id.toString()
	}
      console.log('reciving post via fetch : ', data);
      store_post(data);
      clearTimeout(update_timeout)   // update runs once after 10 seconds reciving no post
      update_timeout = setTimeout(function(){
	remoteStorage.microblog.update()
      }, 10000)
    }
}

function process_response(message) {
    //console.log('SH received message', message);
    if(message.platform == 'twitter')
	process_twitter_message(message);
    
}

function sockethub_eventlisteners(){
  sockethubClient.on( 'message', process_response); 
  sockethubClient.on('unexpected-response', function(resp){
    console.log('UNEXPECTED-RESPONSE ', resp, arguments);
  })
  remoteStorage.profile.load().then(function(profile){
    if(!profile)
      sockethubClient.on('message', grab_profile)
  })
}    



function set_twitter_credentials(cfg){
    return sockethubClient.set('twitter', 
		  { credentials : { me : cfg } }
    ).then(function (resp) {
      if(resp.status != true)
        throw(resp);
      console.log('successfully set credentials for twitter account', resp);
      remove_class(dove_widget, 'offline');
      remove_class(dove_widget, 'expanded');
      
      f(dove_widget,'icon').onclick = fetch_tweets
    }).then(undefined, function (err) {
      console.log('error sending credentials for twitter :( ', err);
    } );
}

function syndicate_to_twitter(post){
  console.log('syndication in progress',post)
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
    setTimeout(fetch_tweets,1000);
  }, function (err) {
    console.log('oh no! ', err);
  });
}

function fetch_tweets(feed)
{
  if(!(feed instanceof String) )
    feed = 'user'
  var obj = {
    platform : 'twitter',
    verb : 'fetch',
    actor : { address : 'me' },
    target : [ { address : feed }],
    poll : true 
  }
  console.log(obj);
  return sockethubClient.sendObject(obj).then(function(response) {
    console.log('Here\'s the response of fetch : ',response)
  }, function(e){
    console.log('oh noooo!', e)
  })
}

function grab_profile (message){
  if(message.platform == 'twitter' && message.verb == 'post'){
    remoteStorage.profile.load().then(function(profile){
     if(!profile){
       profile = {
         screenname : message.actor.address,
         name : message.actor.name,
         profile_image_url : message.actor.image
       }
       console.log("grabed a profile from your tweets", profile)
       remoteStorage.profile.save(profile);
     }
    })
  }
}

function rs_init_syndication(){
  return remoteStorage['credentials-sockethub'].get('profile').then(
    function(cfg){
      var sc = init_sockethub(cfg);
      sc.on('registered', function(){
        sockethub_eventlisteners();
        remoteStorage['credentials-twitter'].get('profile').then(
          function(twitter_cfg){
            set_twitter_credentials(twitter_cfg)
          } )
      } )
    } )
}

function init_syndication(form){
  sc = init_sockethub(gui_sh_cfg(form));
  sc.on('registered', function(){
    sockethub_eventlisteners();
    set_twitter_credentials(gui_twitter_cfg())
  })
}
