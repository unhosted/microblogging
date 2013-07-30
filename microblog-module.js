RemoteStorage.defineModule('microblog', function(privateClient, publicClient){
  publicClient.declareType('micropost', {
    type : 'object',
    properties : {
      screenname : {
	type : 'string',
        required : true
      },
      fullname : {
	type : 'string',
        required: false
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
        type : 'string',
        required: false
      },
      avatar : {
	type : 'string',
        required: false
      }
    }
  });
  publicClient.declareType('microposts_list', {
    type : 'array'
  });

  var path = "microposts/"
  function getAllSorted(path){
    var promise = promising();
    getAll(path).then(function(list){
      var len = list.length;
      var item_list = []
      list.forEach(function(item){
        publicClient.getObject(item).then(function(item){
          item_list.push(item);
          len--;
          if(len==0){
            item_list = item_list.sort(function(a, b){
              if(a.date > b.date)
                return 1;
              else if(a.date < b.date)
                return -1;
              else
                return 0;
            })
            promise.fulfill(item_list);
          }
        });
      })
    })
    return promise;
  }
  function getAll(path){
    var all_items = [];
    var promise = promising();
    var len = 1;
    _getAll(path);
    function _getAll(current_path){
      console.log(current_path,len);
      publicClient.getListing(current_path).then( function(listing){
        var dirs = [];
        if(!listing)
          return
        for(var i = 0; i < listing.length; i++){
          var item = listing[i];
          if(is_dir(item))
            dirs.push(item)
          else
            all_items.push(current_path+item)
        }
        len += dirs.length;
        dirs.map(function(d){
          return current_path+d
        }).forEach(_getAll)
      }).then(function(){
        len--;
        if(len<=0){
          promise.fulfill(all_items);
        }
      })
    }
    return promise;
  } 


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
    
  var keys =   ['screenname',  'fullname', 'date', 'text', 'post_id', 'twitter_id', 'avatar']
  
  
  function store_micropost(data){
    // building Post obj
    var obj = {};
    keys.forEach(function(k){   //enshure only fields that are part of the schema are saved
      var t
      if(!(t=data[k]) )
        t="";
      obj[k] = t;
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
  
  function update_microblogs_list(user){
    if(typeof(user) === 'undefined')
      user = '';
    else if(user[user.length]!='/')
          user = user+'/';
    return getAllSorted(path+user).then( function(list) {
      var microposts_list = [];
      list.forEach( function(item) {
        microposts_list.push( 
          publicClient.getItemURL( post_path(item)+item.post_id ) 
        )
      } )
      /*var name = 'microposts_list'
      if(user.length > 0)
        name+='_'+user
        at a later point I might want to change the list name so that there can be one list per screenname but the app doesn't support this yet
      */
      console.log('updating microposts list', microposts_list);
      publicClient.storeObject('microposts_list','microposts_list', microposts_list);
      
      return microposts_list;
    })
  }

  return {
    'exports' : {
      pub: publicClient, //TODO while deuging 
      'load' : function(name){
        console.log('loading ',name);
	
	return publicClient.getObject(name);
      },
      'clear' : function(){
        var promise = promising()
        function error_occured(e){
            promise.reject(e);
          }
        getAll(path).then(function(list){
          len = list.length;
          list.forEach(function(item){
            publicClient.remove(item);
          }).then(function(){
            len--;
            if(len==0)
              promise.fulfill();
          },error_occured)
        }).then(undefined, error_occured);
        return promise;
      },
      'update' : update_microblogs_list,
      'post' : function(data){
	return store_micropost(data).then(function(){
	  update_microblogs_list(data.screenname);
        });
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
      'list' : function(user){
        if(typeof(user) === 'undefined')
           user = '';
        else if(user[user.length]!='/')
          user = user+'/';
	return getAllSorted(path+user);
      },
      'onchange' : function(callback){
	return publicClient.on('change', callback);
      },
      'path' : post_path
    }
  }
});
