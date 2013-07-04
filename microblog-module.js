remoteStorage.defineModule('microblog', 
  function(privateClient, publicClient){
      publicClient.declareType('micropost', {
	  'type' : 'object',
	  'properties' : {
	      'screenname' : {
		  type : 'string'
	      },
	      'fullname' : {
		  type : 'string'
	      },
	      'date' : {
		  'type' : 'integer'
	      },
	      'text' : {
		  'type' : 'string'
	      },
	      'post_id' : {
		  'type' : 'string'
	      },
	      'avatar' : {
		  type : 'string'
	      }
	  },
      });
      publicClient.declareType('micropost_list', {
	  'type' : 'Array'
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
    
    function sort_posts(_posts, _path){
      if(typeof(_path) === 'undefined')
        _path = path;
      posts = {};
      console.log('sorting posts')
      
      _posts.forEach( function(post_id){
        this.fullfiled = 1;
        var len = _posts.length
        publicClient.getObject(_path+post_id).then(function(obj) {
          var target_path = post_path(obj)
          console.log(target_path);
          if(posts[target_path] instanceof Array)
            posts[target_path].push(obj)
          else posts[target_path] = [obj]
        }).then(function(){
          this.fullfiled += 1;
          console.log(this.fullfiled)
          if(this.fullfiled >= len)
            sort_em();
        }.bind(this))
      })
      function sort_em() {
        //I realized this won't work can't user finally statements that way
        console.log("posts after try",posts)
        try {
          Object.keys(posts).forEach( function(target_path) {
            publicClient.getListing(target_path).then( function(listing){
              listing.forEach(function(item) {
                publicClient.getObject(target_path+item).then( function(post){
                  posts[target_path].forEach( function(obj) {
                    if(post.text == obj.text )
                      //&& post.fullname == obj.fullname && post.avatar == obj.avatar 
                      throw(["same post found",post,obj])
                  })
                })
              })
            })
          })
                
        } catch (e ) {
          if( e instanceof Array 
              && e[0] == "same post found"  ) {
            publicClient.deleteObject(target_path+e[1].post_id);
            //ausming the incoming post is better somehow
          }
        } finally {
          console.log( "posts ", posts)
          for(target_path in posts){
            posts[target_path].forEach( function(obj) {
              publicClient.storeObject(
                'micropost',
	        post_path(obj)+obj.post_id, 
                obj ).then( function() {
                  publicClient.remove(_path+obj.post_id)
                })
              ;
            })
          }
        }
      }
    }

    
    function is_dir(path){
      return item[item.length-1] == '/';
    }

    function find_newest(ammount, user_list){
      function find_newest_for(ammount, user){
        var list = [];
        
        function _newest(_path){
          publicClient.getListing(_path).then( function(listing) {
            var items = [];
            var dirs = listing.sort().filter( function(item) {
              if(!is_dir){
                items.push( item );
                return false
              }
              return true;
            })
            dirs.forEach( function(dir){
              _newest( _path+dir );
            });

            if(items.length > 0){
              publicClient.getAll(_path+item).then( function(posts) {
                posts.sort(function(p1, p2){
                  var d1 = p1.date;
                  var d2 = p2.date;
                  if(d1 > d2)
                    return 1
                  else if( d1 < d2 )
                    return -1
                  else
                    return 0
                })
                list.push(
                  posts.map(function(p){ 
                    return _path+p.post_id
                  })
                )
                if(list.length > ammount)
                  throw("found enough posts")
                
              })    
            }
          })
        }
        try{ 
          _newest(path+user)
        } catch( e ){
          if( e === "found enough posts") {
            console.log(list);
            return list.slice(0,ammount);
          }
        }
      }
      return find_newest_for(10, user_list[0]); //TODO only supporting one user for now
      user_list.forEach(function(user){
         
      })
    }

    function update_microblogs_list( options ){
      if(typeof(options) === 'undefined')
        options = { newest : 10, senders : [], target : 'micropost_list'}
      return publicClient.getListing(path).then(
	function(items){
	  var posts = [];
	  var users = [];
          var list
          var len =  items.length;
          for(var i = 0; i < len; i++){
            var item = items[i];
            if(item[item.length-1] == '/'){
              users.push(item);
            }else{
              posts.push(item);
            }
          }
          delete len;
          
          sort_posts(posts);

          var senders = options.senders
          if(senders.length > 0){
            users = users.filter(function(user){
              return ( senders.indexOf( user.slice(0, user.length) ) < 0 )
            })
          }
          delete senders;
          var list
          var newest = options.newest;
          if(newest)
          //  list = find_newest( options.newest, users );
          delete newest;
          
          console.log(posts);
          console.log(users);
          //publicClient.storeObject(options.target,'microposts_list',list)
	      }
	  );
    }
    
    var schemas = publicClient.schemas;
    var keys = Object.keys(schemas[Object.keys(schemas)[0]].properties);
    delete schemas;
    
    function store_micropost(data){
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
      
      return publicClient.storeObject('micropost',
				      post_path(obj)+obj.post_id, obj)
    }

      return {
	  'exports' : {
	      pub: publicClient,
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
	      'remove' : function(name){
		  console.log('removing : ',name);
		  return publicClient.remove(path+name);
	      },
	      'list' : function(){
		  return publicClient.getListing(path);
	      },
	      'onchange' : function(callback){
		  return publicClient.on('change', callback);
	      }
	  }
      }
  });
