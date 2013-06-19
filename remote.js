function init_remotestorage(){

    remoteStorage.claimAccess(
	{
	    'microblog':'rw',
	    'profile':'rw'
	});
    remoteStorage.displayWidget();
    document.all.login.style.display = 'none';
    document.all.micropost.style.display = 'block';
    f(profile_div, 'edit').style.display = 'block';
    document.baseURI+='&me=true;'
}


function create_post(){
    var data = new Object;
    data['text'] = document.forms.micropost.text.value
    data['created_at'] = Date();
    remoteStorage.microblog.post(data);
    new_post(data);
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
