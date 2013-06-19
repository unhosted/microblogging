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

}


function create_post(){
    var data = new Object;
    data['text'] = document.forms.micropost.text.value
    data['created_at'] = Date();
    remoteStorage.microblog.post(data);
    new_post(data);
}

function edit_profile(){
    
}
