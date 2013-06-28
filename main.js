
var feeds_div;
var profile_div;

var blogpost_template;

var keys;
var sockethubClient;

var options;
var url;


var gui_post_ids;
var posts = [];


function init(){

    options = args_to_object(document.location.search);

    feeds_div = document.getElementById('feeds');
    profile_div = document.getElementById('profile');

    gui_post_ids = 0;
    blogpost_template = document.getElementById('blogpost_template');

    if(options.keys) {
	registration_init(options)
    }
    

    if(options.me == 'true'){
        init_remotestorage();
    } else {
        var base_url = options.base_url;
        if(base_url) {
          aggregate(base_url+'/microblog/microposts_list');
          get_profile(base_url+'/profile/me');
        }
    }
    f(profile_div,'edit').onclick = edit_profile_callback.bind(
	{'screenname' : '',
	 'name' : '',
	 'description' : '',
	 'location' : '',
	 'homepage' : '',
	 'profile_image_url' : ''}
    );

}


function get_items (items) {
    items.sort(function(a,b){
        if(a.created_at < b.created_at)
            return -1;
        if(a.created_at > b.created_at)
            return 1;
        return 0;
    }); // TODO lets see if this works with timestamps in the used format (whatever that might be)
    items.forEach(aggregate_item);
}

function aggregate(url){
    get_url(url, get_items);
}

function aggregate_item(url){
    get_url(url, new_post);
}

function get_profile(url){
    get_url( url, set_profile );
}

function set_profile(profile){
    console.log("Setting Profile : ",profile);
    const profile_keys = ['screenname','name','description','location'];
    fill_div(profile_div, profile_keys, profile);
    f(profile_div,'profile_img').src = profile.profile_image_url;
    f(profile_div, 'homepage').href = profile.homepage;
    f(profile_div,'edit').onclick = edit_profile_callback().bind(profile);
}


window.onload = init;
