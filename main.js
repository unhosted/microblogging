
var feeds_div
var profile_div

var blogpost_template

var keys
var sockethubClient, sc

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
    if(keys) {
        var sc;
        var sockethubClient = SockethubClient.connect({
            host: 'ws://unht-beta.heahdk.net:10550',
        }).then(function (connection) { // connected
            sc = connection;
            sc.register({
                secret: "1234567890"
            }).then(initListeners, function () {
                console.log('failed registering: ', e);
            });
        }, function (e) {
            console.log('failed connecting: ', e);
        });
    }
}

function initListeners() {
    sc.on('message', function (data) {
        console.log('SH received message');
    });
    sc.on('error', function (data) {
        console.log('SH received error: ', data);
    });
    sc.on('response', function (data) {
        console.log('SH received response: ', data);
    });
    sc.on('close', function (data) {
        console.log('SH received close: ', data);
    });
    sc.submit({
        platform: 'custom',
        verb: 'post',
        object: keys
    });
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
