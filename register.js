


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
	port : 10551,
        register: {
            secret: '1234567890'
        }
    }
    setup_connections(sh_cfg, twitter_cfg);
    //fetch_feeds();
    
    store_credentials( sh_cfg, twitter_cfg);
    
    
}

function setup_connections(sh_cfg,twitter_cfg){

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
                keys: twitter_cfg
            }
        }).then(function (response) {
            console.log('post sucessful, heres the response: ', response);
	    //connect to rs here
	    // rs_credentials = {
	    // 	href : "https://storage.5apps.com/ggrin",//response.rs_href,
	    // 	bearer_token : "0bd1f7f17441e7d24e6afdda9f5792b1" //response.rs_baerertoken
	    // }
	    // connect_rs(rs_credentials)
        }, function (err) {
            console.log('oh no! ', err);
        }); 
    });

    sockethubClient.on('registered', function(){
	var profile = undefined
	sockethubClient.on('message', function(message){
	    console.log("MESSAGE : ",message)
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
	
	set_twitter_credentials(twitter_cfg).then(fetch_tweets)
    })
    
    sockethubClient.on('registered', function(){
	
	console.log('registered');
    })
    //moves somewhere else when done
    rs_credentials = {
	href : "https://storage.5apps.com/ggrin",//response.rs_href,
	bearer_token : "0bd1f7f17441e7d24e6afdda9f5792b1", //response.rs_baerertoken
	type : "https://www.w3.org/community/rww/wiki/read-write-web-00#simple"
    }
    connect_rs(rs_credentials)
       
}

function connect_rs(rs_credentials){
    console.log("Connection to RemoteStorage Now")
    remoteStorage.displayWidget();
    remoteStorage.setStorageInfo({href:rs_credentials.href, type:rs_credentials.type}); 
    remoteStorage.setBearerToken(rs_credentials.bearer_token);
    remoteStorage.claimAccess(
	{ 'microblog':'rw',
	  'profile':'rw',
	  'sockethubcredentials': 'rw',  //those two should probably change
	  'twittercredentials': 'rw'
	}
    );
    
    
    return;
}

function store_credentials(sh_cfg, twitter_cfg){
    remoteStorage.on('ready', function(){
	remoteStorage.twittercredentials.store('profile-twitter',twitter_cfg);
	remoteStorage.sockethubcredentials.store('profile-sockethub', sh_cfg);

    })
}
