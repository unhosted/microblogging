var rs_scope = 	{
  'profile':'rw',
  'credentials-twitter': 'rw',
  'credentials-sockethub': 'rw',
  //'credentials-facebook' : 'rw',
  'microblog':'rw'
}
var sockethub_widget;
var dove_widget;

function init_remotestorage(){


  //remoteStorage = new RemoteStorage;
  remoteStorage.displayWidget();
  remoteStorage.claimAccess( rs_scope );
  
  remoteStorage.caching.reset();
  remoteStorage.caching.enable('/public/profile/');
  remoteStorage.caching.enable('/public/microblog/microposts/');
  remoteStorage.caching.enable('/credentials-twitter/')
  remoteStorage.caching.enable('/credentials-sockethub/')
  //remoteStorage.caching.enable('/credentials-facebook/')  

  document.getElementById('login').style.display = 'none';
    
  remoteStorage.on('ready', rs_on_ready );
    
  remoteStorage.on('disconnect', rs_on_disconnect);
    
    
    
  sockethub_widget = document.getElementById('sockethub-widget')
  dove_widget = document.getElementById('dove-widget')
  
  options.me = 'true';
  push_state(options);
   

  remoteStorage.onChange('/public/microblog/microposts/', function(resp){
    console.log("RS processing onchang : ", resp);
    var item = undefined;
    
    if( !resp.newValue && !resp.oldValue ){
      console.log("weired things happen")
      return;
    }
    
    if (typeof(resp.newValue) == 'undefined' 
	&& ( item = post_by_id(resp.oldValue.post_id) ) ) {
      console.log("DELETE POST");
      gui_delete_post(item);
    } else if(!post_by_id(resp.newValue.post_id)
              ){//&& typeof(resp.oldValue) == 'undefined' ) {
      console.log("NEW POST");
      new_post(resp.newValue);
    } else if(resp.oldValue && resp.newValue 
              && resp.oldValue != resp.newValue
	      && ( item  = post_by_id(resp.oldValue.post_id) )){
      console.log("UPDATE POST");
      item.fill_post(undefined,resp.newValue)
    }
  })

  
  remoteStorage.profile.onchange( function(resp) {
    console.log("profile.onchange : ", resp);
    if( resp.path.match(/\/profile\/me/) ){
      //console.log("UPDATEING PROFILE : ", resp);
      if(resp.newValue != resp.oldValue){
        var me = resp.newValue;
        options.base_url = remoteStorage.remote.href + '/public';
        set_profile(me);
      }
    }
  })

  remoteStorage.onChange('/credentials-twitter/profile',function(resp){
    var cfg = resp.newValue
    if(cfg) {
      console.log('setting twitter in gui')
      var item = f(dove_widget,'expandable');
      ['consumer_key','consumer_secret', 
       'access_token', 'access_token_secret'].forEach(
         function(key){
           if(item[key])
             item[key].value = cfg[key];
         })
      if(sockethubClient){
        set_twitter_credentials(cfg);
      }
    }
  })
  remoteStorage.onChange('/credentials-sockethub/profile', function(resp) {
    var cfg = resp.newValue;
    if(cfg) {
      var item = f(sockethub_widget,'expandable');
      ['host','port'].forEach(
        function(key){
          if(item[key])
            item[key].value = cfg[key];
        })
      item.secret.value = cfg.register.secret;
      item.ssl.checked = cfg.ssl
    }
  } )
  
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
  //console.log('!!! on ready !!!')
  remoteStorage.credentialsTwitter.get('profile').then(gui_set_twitter);
  remoteStorage.credentialsSockethub.get('profile').then(gui_set_sh);
  forEach(document.getElementsByClassName('remote'), function(el){
    el.style.display = 'block'
  })
}
     
function store_post(data){
  return remoteStorage.microblog.store(data).then(function(){
    console.log('storing this one', data);
  }, function(e){
    console.error("something went wrong ... ",e,data)
  });
}

function create_post(){    
  var data = new Object;
  data.text = document.forms.micropost.text.value
    
  function post_it(data){
    console.log(data);
    if(sockethubClient && dove_it['yes'] )
      syndicate_to_twitter(data);
    store_post(data);
  }
  

  remoteStorage.profile.load().then(
    function(me){
      if(!me)
	throw("profile not found")
      data.screenname = me.screenname
      data.fullname = me.name;
      data.avatar = me.profile_image_url
      post_it(data);
    }).then( undefined, function(e){
      console.log("unable to fill  in your profile info : ", e)
      post_it(data);
    } )
  
}

// delete and restore posts

function gui_delete_post(post){
  var div = post.div;
  add_class(div,'deleted');
  f(div, 'delete').onclick = function(){
    restore_post(post);
  }	    
}

function delete_post(data){
  console.log("removing ", data);
  remoteStorage.microblog.remove(data);
}

function restore_post(post){
  var data = post.data;
  var div = post.div;
  remoteStorage.microblog.post(data).then(
    function() {
      remove_class(div, 'deleted');
      f(div,'delete').onclick = function(){
        delete_post(data);
      }
    }
  )
}

// profile edit buttons

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
   'profile_image_url' ].forEach( function(key){
     var i = profile_div[key];
     i.value = profile_data[key];
     i.style.display = 'inline';
   })
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

//credentials
function gui_sh_cfg(form){
  if(typeof(form) === 'undefined')
    form = f(sockethub_widget,'expandable');
  
  return { host : form.host.value,
           port : form.port.value,
           ssl : form.ssl.checked,
           register : {
             secret : form.secret.value
           }
         }
}
function gui_set_sh(cfg){
  if(!cfg)
    return;
  var form = f(sockethub_widget, 'expandable') 
  form.host.value = cfg.host;
  form.port.value = cfg.port;
  form.ssl.checked = cfg.ssl;
  form.secret.value = cfg.register.secret;
  return cfg;
}
function gui_twitter_cfg(form){
  if(typeof(form) === 'undefined')
    form = f(dove_widget,'expandable');
  return {
    consumer_key : form.consumer_key.value,
    consumer_secret : form.consumer_secret.value,
    access_token : form.access_token.value,
    access_token_secret : form.access_token_secret.value
  }
}
function gui_set_twitter(cfg){
  if(!cfg)
    return;
  var form = f(dove_widget, 'expandable')
  form.consumer_key.value = cfg.consumer_key;
  form.consumer_secret.value = cfg.consumer_secret; 
  form.access_token.value = cfg.access_token;
  form.access_token_secret.value = cfg.access_token_secret;
  return cfg;
}

function store_sh_credentials(form){
  var data = gui_sh_cfg(form);
  remoteStorage['credentials-sockethub'].store('profile', data)
}
function store_twitter_credentials( form){
  var data = gui_twitter_cfg(form);
  remoteStorage['credentials-twitter'].store('profile', data);
  if(sockethubClient){
    console.log("set_twitter_credential",data)
    set_twitter_credentials(data);
  }
}

