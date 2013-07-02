var rs_scope = 	{ 'microblog':'rw',
	  'profile':'rw',
	  'sockethubcredentials': 'rw',  //those two should probably change
	  'twittercredentials': 'rw'
	}


function init_remotestorage(){
    
    document.all.login.style.display = 'none';
    
    remoteStorage.on('ready', rs_on_ready );
    
    remoteStorage.on('disconnect', rs_on_disconnect);
    

    remoteStorage.claimAccess( rs_scope );
    remoteStorage.displayWidget();
    
    
/*    if(document.location.search.indexOf("me=true") < 0){

	window.location.replace('?me=true');
    }
  */  

    remoteStorage.microblog.onchange(function(resp){
	console.log("RS processing onchang : ", resp)
	var item = undefined;
	if(resp.path.match(/\/public\/microblog\/microposts\//)){
	    if(resp.oldValue == undefined 
	       && !post_by_id(resp.newValue.post_id)) {
		console.log("NEW POST");
		new_post(resp.newValue);
	    } else if (resp.newValue == undefined 
		       && ( item = post_by_id(resp.oldValue.post_id) ) ) {
		console.log("DELETE POST");
		gui_delete_post(item);
	    } else if(resp.oldValue && resp.newValue 
		     && ( item  = post_by_id(resp.oldValue.post_id) )){
		console.log("UPDATE POST");

		item.fill_post(undefined,resp.newValue)
	    }
	}
    })
    
    remoteStorage.profile.onchange( function(resp) {
	console.log("profile.onchange : ", resp);
	if( resp.path.match(/\/profile\/me/) ){
	    console.log("UPDATEING PROFILE : ", resp);
	    var me = resp.newValue;
	    set_profile(me);
	}
    })
    
}

function rs_on_disconnect()	{
    forEach(document.getElementsByClassName('remote'), function(el){
	el.style.display = 'none'
    });
    forEach(document.getElementsByClassName('edit_profile'), 
	function(el){
	    el.style.display = 'none'
	}
    );
}


function rs_on_ready(){	
    forEach(document.getElementsByClassName('remote'), function(el){
	el.style.display = 'block'
    })
    
    remoteStorage.sockethubcredentials.get('profile-sockethub').then(
	function(cfg){
	    sockethubClient = init_sockethub(cfg)
	    sockethubClient.on('registered', function(resp){
		remoteStorage.twittercredentials
		    .get('profile-twitter').then( function(cfg){
			set_twitter_credentials(cfg).then(
			    fetch_tweets);
		    })
	    })
	    sockethub_eventlisteners(sockethubClient);
	}
    )

}
     
function process_post(data){
    remoteStorage.microblog.load(data.post_id).then(
	function(inDB){
	    if(inDB){
		console.log('had this stored already' ,data)
	    } else {
		console.log('storing this one', data);
		remoteStorage.microblog.store(data);
	    }
	}
    ).then(undefined, 
	   function(e){
     	       console.log('error occured while loading post : ',e)
	   }
	  )	   
}

function create_post(){    
    var data = new Object;
    data.text = document.forms.micropost.text.value
    
    function post_it(data){
	console.log(data);
	if(sockethubClient)
	    syndicate_to_twitter(data)
	else{
	    remoteStorage.microblog.post(data).then(
		undefined , function(e){
		    console.log('something with storeing went very wrong : ',e)
		}
	    )
	}
    }

    remoteStorage.profile.load().then(
	function(me){
	    if(!me)
		throw("profile not found")
	    data.screenname = me.screenname
	    data.fullname = me.name;
	    data.avatar = me.profile_image_url
	    
	    if(sockethubClient){
		syndicate_to_twitter(data);
		return;
	    }
    
	    post_it(data);

	    remoteStorage.microblog.post(data).then(undefined,
		function(e){
		    console.error("unable to store post ",data," because : ", e);
		}
	    )
	    
	
	}).then( undefined, function(e){
	    console.log("unable to fill  in your profile info : ", e)
	    post_it(data);
	}
    )
}
function gui_delete_post(post){
    var div = post.div();
    div.className += ' deleted';
    var b = f(div, 'delete');
    b.innerHTML = 'restore';
    b.onclick = function(){
	restore_post(post);
    }
	    
}

function delete_post(post){
    console.log('deleteing post : ', post.gui_post_id, post.post_id)
    remoteStorage.microblog.remove(post.post_id)
}

function restore_post(post){
    var data = {
	'text' : post.text,
	'date' : post.date,
	'post_id' : post.post_id
    }//TODO build object propper
    remoteStorage.microblog.post(data).then(
	function() {
	    var div = post.div();
	    div.className = div.className.replace(/deleted/, '');
	    var b = f(div,'delete');
	    b.innerHTML = 'del';
	    b.onclick = function(){
		delete_post(post);
	    }
	}
    )
}


function done_editing_profile_callback(){
    event.preventDefault();
    done_profile(this);
}

function edit_profile_callback(){
    event.preventDefault();
    edit_profile(this);
}

function edit_profile(profile_data){
    ['screenname','name','description','location', 'homepage',
      'profile_image_url' ].forEach( 
	      function(key){
		  /*if(key[0] == '@')
		      return ;*/
		  var i = profile_div[key];
		  i.value = profile_data[key];
		  i.style.display = 'inline';
	      }
	   )
    var t = f(profile_div, 'edit');
    t.innerHTML = 'done';
    t.onclick = done_editing_profile_callback.bind(profile_data);    
}

function done_profile(profile_data){
  
    ['screenname','name','description','location', 'homepage',
      'profile_image_url' ].forEach( 
	  function(key){
	      var i = profile_div[key];
	      profile_data[key] = i.value ;
	      i.style.display = 'none';
	  }
      )
    remoteStorage.profile.save(profile_data);
    var t = f(profile_div, 'edit');
    t.innerHTML = 'edit';
    t.onclick = edit_profile_callback.bind(profile_data);
}
