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
	      /*'retweet' : {
		  'type' : 'Object',
		  'properties' : {
		      
		  }
	      },*/
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

      function store_micropost(data){
	  if(!data.date){
	      data.date = (new Date).getTime()
	  }
	  if(!data.post_id)
	      data.post_id = publicClient.uuid().replace(':','_');
	  console.log('saving : ',data);

	  return publicClient.storeObject('micropost',
					  path+data.post_id, data)
      }

      return {
	  'exports' : {
	      //pub: publicClient,
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
	      }
	  }
      }
  });
