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

      function update_microblogs_list(){
	  return publicClient.getListing(path).then(
	      function(posts){
	
		  var items = [];
		  var len =  posts.length;
		  for( var i = 0; i <= len; i++){
		      items.push(publicClient.getItemURL(path+posts[i]));
		  }
		  publicClient.storeObject('micropost_list','microposts_list',items)
	      }
	  );
      }
      var schemas = publicClient.schemas;
      var keys = Object.keys(schemas[Object.keys(schemas)[0]].properties);
      function store_micropost(data){
	  if(!data.date){
	      data.date = (new Date).getTime()
	  }
	  if(!data.post_id)
	      data.post_id = publicClient.uuid().replace(':','_');
	  console.log('saving : ',data);
	  var obj = {};
	  keys.forEach(function(k){   //enshure only fields that are part of the schema are saved
	      obj[k] = data[k];
	  });
	  return publicClient.storeObject('micropost',
					  path+data.post_id, obj)
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
