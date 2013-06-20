function init_remotestorage(){

    remoteStorage.claimAccess(
	{
	    'microblog':'rw',
	    'profile':'rw'
	});
    remoteStorage.displayWidget();
    document.all.login.style.display = 'none';
    // document.all.micropost.style.display = 'block';
    // f(profile_div, 'edit').style.display = 'block';
    document.baseURI+='&me=true;' // TODO how to handle this
    forEach(document.getElementsByClassName('remote'), function(el){
	el.style.display = 'block'
    })
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
