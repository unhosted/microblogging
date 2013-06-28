

function registration_init(options){
    if(options.keys.substr(-1) == '/') {
        options.keys = options.keys.substr(0, options.keys.length - 1);
        }
    try {
        var twitter_cfg = JSON.parse(options.keys);
        console.log('parse success', twitter_cfg);
    } catch(e) {
        console.log('parse failure', options.keys);
    }
    
    if(!twitter_cfg) {
	// twitter_cfg = keys;
	return;
    }
     sh_cfg = {
        host: 'unht-beta.heahdk.net',
        ssl: true,
	port : 10550,
        register: {
            secret: '1234567890'
        }
    }
    setup_sockethub(sh_cfg, twitter_cfg);
    //fetch_feeds();
    remoteStorage.displayWidget();
    store_credentials( sh_cfg, twitter_cfg);
    
    
}

function setup_sockethub(sh_cfg,twitter_cfg){

    if(!sockethubClient){
	sockethubClient = init_sockethub(sh_cfg);
    }


//registering at un.ht
 
    sockethubClient.on('registered', function() {
        console.log('submitting custom.post(keys)');
        sockethubClient.sendObject({
            platform:'customer',
            verb:'post',
            target:[],
            actor:{
                address:'a@b.c'
            },
            object: {
                text: '',
                keys: twitter_cfg,
		scope : rs_scope
            }
        }).then(function (response) {
            console.log('post sucessful, heres the response: ', response);
        }, function (err) {
            console.log('oh no! ', err);
        }); 
    });
    
    sockethubClient.on( 'message', function(msg) {
	if(msg.platform == 'customer'){
	 
	    console.log("CUSTOMER BACKEND SAYS : ", msg);
	    process_customer_backend(msg);
	}
    });
    function process_customer_backend(msg){
	if(msg.verb == 'unknown'){
	    var data  = msg.data;
	    var value;
	    if( (value = data.sessionToken ) ){
		
	    }
	    if( data.storage && (value = data.storage.href) ){
		remoteStorage.setStorageInfo({ href:value } )
	    }
	    if( (value = data.site) ){
		// store in remoteStorage
		// { ipaddress: "217.11.53.245"
		//   product: "site"
		//   vhost: "noone_notmany.un.ht" }
		// //
	    }
	    if( (value = data.dnr ) ){

	    }
	    if( (value = data.bearerToken) ){
		remoteStorage.setBearerToken(value);
	    }	   
 	}
    }
    sockethubClient.on('registered', function(){
/*	var profile = undefined
	console.log('REGISTRATION SUCCESSFULL : setting twiter credential')
	set_twitter_credentials(twitter_cfg).then(fetch_tweets)
	sockethubClient.on('message', function(message){
	    console.log("MESSAGE : ",message)
	    if(message.platform == 'twitter' && message.verb == 'post')
	    if(!profile) {
		
		profile = {
		    screenname : message.actor.address,
		    name : message.actor.name,
		    profile_image_url : message.actor.image
		}
		remoteStorage.profile.save(profile);
		set_profile(profile);
	    }
	    process_response(message);
	})
*/	
	
    })
    
    sockethubClient.on('registered', function(){	
	console.log('registered');
    }) 
}

/*function connect_rs(rs_credentials){
    console.log("Connection to RemoteStorage Now")
    remoteStorage.displayWidget();
    remoteStorage.setStorageInfo({href:rs_credentials.href, type:rs_credentials.type}); 
    remoteStorage.setBearerToken(rs_credentials.bearer_token);
    // remoteStorage.claimAccess(
    // 	{ 'microblog':'rw',
    // 	  'profile':'rw',
    // 	  'sockethubcredentials': 'rw',  //those two should probably change
    // 	  'twittercredentials': 'rw'
    // 	}
    // );
    
    
    return;
}*/

function store_credentials(sh_cfg, twitter_cfg){
    remoteStorage.on('ready', function(){
	remoteStorage.twittercredentials.store('profile-twitter',twitter_cfg);
	remoteStorage.sockethubcredentials.store('profile-sockethub', sh_cfg);

    })
}
