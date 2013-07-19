
var feed_div;
var profile_div;

var blogpost_template;

var keys;
var sockethubClient;
var dove_it;

var options;
var url;


var gui_post_ids;
var posts = [];


function init(){

    options = args_to_object(document.location.search);

    feed_div = document.getElementById('feed');
    profile_div = document.getElementById('profile');

    gui_post_ids = 0;
    blogpost_template = document.getElementById('blogpost_template');

    // if(options.keys) {
    //     registration_init(options)
    // }
    
  
  if(options.me == 'true'){
    init_remotestorage();
  } else {
    var base_url = options.base_url;
    if(base_url) {
      aggregate(base_url+'/microblog/microposts_list');
      get_profile(base_url+'/profile/me');
    }
  }
  if(options.syndicate == 'true'){
    remoteStorage.on('ready', rs_init_syndication);
  }
  var twitter_cfg
  if( options.twitter )
    if ( twitter_cfg = objectify_arguments(options.twitter))  {
    store_twitter_credentials(twitter_cfg);
  }
  var sh_cfg
  if(options.sockethub && ( sh_cfg = objectify_arguments(options.sockethub) )){
    store_sh_credentials(sh_cfg);
  }

  if( !( options.me || options.syndicate 
         || options.twitter || options.sockethub 
         || options.base_url) ){
    document.getElementById('help').style.display = 'block'
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
  items = items.sort(function(a,b){
      if(a.created_at < b.created_at)
          return -1;
      if(a.created_at > b.created_at)
          return 1;
      return 0;
    });
  console.log("post of this user : ", items);
  var max_items;
  if(max_items = options.max_items){
    items = items.slice(0,max_items)
  }
  items.forEach(aggregate_item);
}

function aggregate(url){
    get_url(url, get_items);
}

function aggregate_item(url){
    get_url(url, new_post);
}

function get_profile(url){
    try {
      get_url( url, set_profile );
    } catch (e){
      console.error("retriving Profile failed : ", e)
    }
}

function set_profile(profile){
  //console.log("Setting Profile : ",profile);
  if(!profile.homepage){
    profile.homepage = window.location.origin+window.location.pathname+"?base_url="+options.base_url
  }
  const profile_keys = ['screenname','name','description','location'];
  fill_div(profile_div, profile_keys, profile);
  f(profile_div,'profile_img').src = profile.profile_image_url;
  f(profile_div, 'homepage').href = profile.homepage;
  f(profile_div,'edit').onclick = edit_profile_callback.bind(profile);
}


window.onload = init;
