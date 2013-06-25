
var feeds_div
var profile_div

var blogpost_template


var options
var url


var post_ids
var posts = []

var profile_data;

function init(){
    
    options = args_to_object(document.location.search);

    feeds_div = document.getElementById('feeds');
    profile_div = document.getElementById('profile');

    post_ids = 0;
    blogpost_template = document.getElementById('blogpost_template');
    
   
    
    if(options.me == 'true'){
	init_remotestorage();
    } else {
	var base_url = options.base_url;
	if(base_url) {
	    aggregate(base_url+'/microblog/microposts_list');
	    get_profile(base_url+'/profile/me');
	}
    }
    if(options.keys) {
      try {
        keys = JSON.parse(options.keys);
        console.log('parse success', keys);
      } catch(e) {
        console.log('parse failure', options.keys);
      }
    }
}      


function new_post(data){
    posts.push(new Post(data));
}

function get_items (items) {
    items.sort(function(a,b){
	if(a.created_at < b.created_at)
	    return -1;
	if(a.created_at > b.created_at)
	    return 1;
	return 0;
    }) // TODO lets see if this works with timestamps in the used format (whatever that might be)
    items.forEach(aggregate_item);
}

function aggregate(url){
    get_url(url, get_items);
}

function aggregate_item(url){
    get_url(url, new_post);
}

function get_profile(url){
    get_url( url, set_profile )
}

function set_profile(profile){
    var profile_keys = ['screenname','name','description','location'];
    fill_div(profile_div, profile_keys, profile);
    f(profile_div,'profile_img').src = 
	profile.profile_image_url;
    f(profile_div, 'homepage').href = profile.homepage;
    profile_data = profile;
}


window.onload = init;
