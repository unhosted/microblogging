function init_remotestorage(){
    
    document.all.login.style.display = 'none';

    remoteStorage.claimAccess(
	{ 'microblog':'rw',
	  'profile':'rw'
	}
    );
    remoteStorage.displayWidget();
    
    
    if(document.location.search.indexOf("me=true") < 0){
/*	history.pushState(undefined, "profile", document.location.search+"&me=true");*/
	window.location.replace('?me=true');
    }
    //remoteStorage.microblog.on('change',function(e){})
    // TODO ask someone why this is wrong

    remoteStorage.on('ready', 
	function(){	
	    forEach(document.getElementsByClassName('remote'), function(el){
		el.style.display = 'block'
	    })
	    // load profile from rs
	    remoteStorage.profile.load().then(
		function(me){
		    console.log('profile form rs',me);
		    if(me){
			set_profile(me);
		    } else { 
			throw "no profile yet?" 
		    }
		    console.log(f(profile_div,'edit'));
		   
		}).then(undefined, function(e){
		    console.error(" unable to load profile: ",e)
		    var me = 	me = {'screenname' : '',
			      'name' : '',
			      'description' : '',
			      'location' : '',
			      'homepage' : '',
			      'profile_image_url' : ''}
		   
		    
		    f(profile_div,'edit').onclick = edit_profile_callback.bind(me);
		})
	    
	    // load posts from rs
	    console.log('loading posts from rs')
	    remoteStorage.microblog.list().then(
		function(l){
		    console.log(l);
		    l.forEach( function(p){
			console.log(p);
			remoteStorage.microblog.load(p).then(
			    new_post
			)
		    })
		}
		, function(e){
		    console.log("error while loading  posts ", e); 
		})

	}
     )
    
    remoteStorage.on('disconnect',
		     function()
	{
	    forEach(document.getElementsByClassName('remote'), function(el){
		el.style.display = 'none'
	    });
	    forEach(document.getElementsByClassName('edit_profile'), 
		    function(el)
		    {
			el.style.display = 'none'
		    }
		   );


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
		new_post(data);
		//assumeing the post is not showen when not saved 
	    }
	}
    ).then(undefined, 
	   function(e){
     	       console.log('error occured while loading post : ',e)
	   }
	  )	   
}

function create_post(){    
    remoteStorage.profile.load().then(
	function(me){
	    var data = new Object;
	    data.text = document.forms.micropost.text.value
	    data.screenname = me.screenname
	    data.fullname = me.name;
	    data.avatar = me.profile_image_url
    
    //data['created_at'] = Date(); // is done in the module now with (new Date()).getTime()
	    remoteStorage.microblog.post(data).then(
		function(){
		    new_post(data);
		}
	    ), function(e){
		console.log('something with storeing went very wrong : ',e)
	    }
	
	}
    )
}

function delete_post(post){
    console.log('deleteing post : ', post.gui_post_id, post.post_id)
    remoteStorage.microblog.remove(post.post_id).then(
	function(){
	    var div = post.div();
	    div.className += ' deleted';
	    var b = f(div, 'delete');
	    b.innerHTML = 'restore';
	    b.onclick = function(){
		restore_post(post);
	    }
	    
	}
    )
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
    set_profile(profile_data);
    var t = f(profile_div, 'edit');
    t.innerHTML = 'edit';
    t.onclick = edit_profile_callback.bind(profile_data);
}
