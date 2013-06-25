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
	    remoteStorage.profile.load().then(set_profile, function(e){
		console.log("no profile yet ? : ",e)
	    })

	    // load posts from rs
			 console.log('loading posts from rs')
	    remoteStorage.microblog.list().then(function(l){
		l.forEach( function(p){
		    console.log(p);
		    remoteStorage.microblog.load(p).then(
			new_post
		    )
		})
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


function create_post(){
    var data = new Object;
    data['text'] = document.forms.micropost.text.value
    //data['created_at'] = Date(); // is done in the module now with (new Date()).getTime()
    remoteStorage.microblog.post(data);
    new_post(data);
}

function delete_post(post){
    remoteStorage.microblog.delete(post.uuid).then(
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
	'uuid' : post.uuid
    }
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

function edit_profile(){
    
    forEach(  Object.keys(profile_data), 
	      function(key){
		  if(key[0] == '@')
		      return ;
		  var i = profile_div[key];
		  i.value = profile_data[key];
		  i.style.display = 'inline';
	      }
	   )
    var t = f(profile_div, 'edit');
    t.innerHTML = 'done';
    t.onclick = function()
    {
	event.preventDefault();
	done_profile();
    }
    
}

function done_profile(){
  
    forEach(  Object.keys(profile_data), 
	      function(key){
		  if(key[0] == '@')
		      return ;
		  var i = profile_div[key];
		  profile_data[key] = i.value ;
		  i.style.display = 'none';
	      }
	   )
    remoteStorage.profile.save(profile_data);
    set_profile();
    var t = f(profile_div, 'edit');
    t.innerHTML = 'edit';
    t.onclick = function()
    {
	event.preventDefault();
	edit_profile();
    }
    
}
