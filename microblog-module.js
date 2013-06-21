remoteStorage.defineModule('microblog', 
  function(privateClient, publicClient){
      publicClient.declareType('micropost', {
	  'type' : 'object',
	  'properties' : {
	      'date' : {
		  'type' : 'integer'
	      },
	      'text' : {
		  'type' : 'string'
	      },
	      'uuid' : {
		  'type' : 'string'
	      },
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

      return {
	  'exports' : {
	      //pub: publicClient,
	      'load' : function(id){
		  return publicClient.getObject(path+id);
	      },
	      'update' : update_microblogs_list
	      ,
	      'post' : function(data){
		  if(!data.date){
		      data.date = (new Date).getTime()
		  }
		  if(!data.uuid)
		      data.uuid = publicClient.uuid();
		  console.log('saving : ',data);
		  return publicClient.storeObject('micropost',
		      path+data.uuid, data)
		      .then(
		 	  update_microblogs_list
		      );
		  
	      },
	      'delete' : function(id){
		  return publicClient.remove(path+id).then(
		      update_microblogs_list
		  );
	      },
	      'list' : function(){
		  return publicClient.getListing(path);
	      }
	  }
      }
  });
