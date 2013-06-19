remoteStorage.defineModule('microblog', 
  function(privateClient, publicClient){
      publicClient.declareType('micropost', {
	  'type' : 'object',
	  'properties' : {
	      'created_at' : {
		  'type' : 'string'
	      },
	      'text' : {
		  'type' : 'string'
	      },
	      /*'retweet' : {
		  'type' : 'Object',
		  'properties' : {
		      
		  }
	      },*/
	  },
      })
      var keys = undefined;
      var path = "microposts/"

      function update_microblogs_list(){
	  return publicClient.getListing(path).then(
	      function(posts){
	
		  var items = [];
		  for( var i in posts){
		      items.push(posts[i]);
		  }
		  console.log(items);
	      }
	  );
      }

      return {
	  'exports' : {
	      pub: publicClient,
	      'keys' : function(){
		  if(!keys){
		      var shemas = publicClient.schemas;
		      keys = Object.keys(shemas[Object.keys(shemas)[0]].properties);
		  }
		  return keys;
	      },
	      'load' : function(id){
		  return publicClient.getObject(path+id);
	      },
	      'update' : update_microblogs_list
	      ,
	      'push' : function(data){
		  return publicClient.storeObject('micropost',
		      path+Math.uuid(), data)
		      .then(
		 	  update_microblogs_list
		      );
		  
	      },   
	  }
      }
  });
