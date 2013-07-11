remoteStorage.defineModule('microblog', function(privateClient, publicClient){
  publicClient.declareType('micropost', {
    type : 'object',
    properties : {
      screenname : {
	type : 'string',
        required : true
      },
      fullname : {
	type : 'string'
      },
      date : {
	type : 'integer',
        required : true
      },
      text : {
	type : 'string',
        required : true
      },
      post_id : {
	type : 'string',
        required : true
      },
      twitter_id : {
        type : 'string'
      },
      avatar : {
	type : 'string'
      }
    }
  });
  publicClient.declareType('micropost_list', {
    type : 'Array'
  });

  var path = "microposts/"

  function post_path(post){
    date = new Date(post.date);
    return path +
      post.screenname + '/' +
      date.getFullYear() + '/' +
      date.getMonth() + '/' +
      date.getDay() + '/';
  }
      
  function is_dir(item){
    return item[item.length-1] == '/';
  }

  function get_newest(_path, ammount, grassed){
    //console.log('get_newest :',_path, ammount, grassed);
    //alert('invoced')
    function newest(_path, ammount, grassed){
      if(typeof(grassed) === 'undefined'){
        grassed = _path+':P';
      }
      return publicClient.getListing(_path).then(function(listing){
        return listing.filter(function(t){
        //  console.log(_path+t)
          return ( is_dir(t) && (_path+t < grassed) )
        }).sort()
      }).then(function(pathes){
        console.log('pathes',_path,pathes,'grassed',grassed);
        if(pathes[pathes.length-1])
          return newest(_path+pathes[pathes.length-1], ammount, grassed)
        else
          return publicClient.getAll(_path);
      }).then(function(items){
        var list = []
        for(i in items){
          list.push(items[i])
        }
        list = list.sort(function(a, b){
          if(a.date > b.date)  return 1;
          if(b.date > a.date) return -1;
          else                 return 0;
        })
        if(list.length < ammount && list.length > 0) {
          return newest(my_path, ammount - list.length, _path).then(
            function(new_list){
              console.log(list.concat(new_list));
              return list.concat(new_list);
            });
        }
        return list
      }).then( function(e){ console.log(
        'get_newest(',
        _path,
        ',',
        ammount,
        ') => ',
        e); return e; } )
    }
    var my_path = _path;
    return newest(_path, ammount, grassed)
  }

  function update_microblogs_list( options ){
    if(typeof(options) === 'undefined')
      options = { newest : 10, senders : [], target : 'micropost_list'}
    return publicClient.getListing(path).then(
      function(items){
	var posts = [];
	var users = [];
        var len =  items.length;
        for(var i = 0; i < len; i++){
          var item = items[i];
          if(is_dir(item)){
            users.push(item);
          }else{
            posts.push(item);
          }
        }

        
        var senders = options.senders
        if(senders.length > 0){
            users = users.filter(function(user){
              return ( senders.indexOf( user.slice(0, user.length) ) < 0 )
            })
          }

        console.log(posts);
        console.log(users);
        users = [users[0]];
        users.forEach(function(user){
          get_newest(path+user, options.newest).then(function(e){console.log('then ....',e); return e;}).then(function(list){
            list = list.map(function(l){
              return publicClient.getItemURL(post_path(l)+l.post_id);
            })
            publicClient.storeObject(options.target,'microposts_list',list)
          })
        })
        
        
      }
    );
  }
    
  var schemas = publicClient.schemas;
  var keys = Object.keys(schemas[Object.keys(schemas)[0]].properties);
  delete schemas;
  
  function store_micropost(data){
    // building Post obj
    var obj = {};
    keys.forEach(function(k){   //enshure only fields that are part of the schema are saved
      obj[k] = data[k];
    });
      
    if(!obj.date){
      obj.date = (new Date).getTime()
    }
    if(!obj.post_id)
      obj.post_id = publicClient.uuid().replace(':','_');
    console.log('saving : ', obj);
      
    return merge_dublicates(obj, post_path(obj));
  }
    
  function merge_dublicates(obj, _path){
    var saved = false;
    return publicClient.getAll(_path).then(function(listing){
      console.log(listing,_path);
      for(post_id in listing){
        var post = listing[post_id]; 
        
        if(post.text.trim() == obj.text.trim()){
          console.log('found dublicate post  : ', post, 'will be merged with', obj)
          keys.forEach(function(k){
            if(!post[k]){
              post[k]  = obj[k];
              console.log('post:',post[k],'new one:',obj[k])
            }
          })
          saved = true
          return publicClient.storeObject('micropost', _path+post_id, post)
        }
      }
      if(!saved){
        publicClient.storeObject('micropost', _path+obj.post_id, obj);
      }
    })  
  }
  return {
    'exports' : {
      pub: publicClient, //TODO while deuging 
      'load' : function(name){
	console.log('loading ');
	  
	return publicClient.getObject(path+name);
      },
      'update' : update_microblogs_list
      ,
      'post' : function(data){
	return store_micropost(data).then(
	  update_microblogs_list
	);
      },
      'store' : function(data){
	return store_micropost(data);
      },
      'remove' : function(item){
        console.log('removing : ',name);
        if(item instanceof String){
          name = item;
        } else {
          name = post_path(item)+item.post_id
        }
	return publicClient.remove(name);
      },
      'list' : function(){
	return publicClient.getListing(path);
      },
      'onchange' : function(callback){
	return publicClient.on('change', callback);
      },
      'path' : post_path
    }
  }
});
