remoteStorage.defineModule('profile', 
  function(privateClient, publicClient){
      publicClient.declareType('profile', {
	  'type' : 'object',
	  'properties' : {
	      'name' : {
		  'type' : 'string'
	      },
	      'screenname' : {
		  'type' : 'string'
	      },
	      'homepage' : {
		  'type' : 'string',
	      },
	      'profile_image_url': {
		  'type' : 'string'
	      },
	      'location' :{
		  'type' : 'string'
	      },
	      'description'  : {
		  'type' : 'string'
	      }
	  },
      })
      var keys = undefined;
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
	      'save' : function(data){
		  // publicClient.getObject('me').then( 
		  //     function(old_data){
		  // 	  keys.forEach( function(k){
		  // 	      if(data[k]===undefined)
		  // 		  data[k] = old_data[k]
		  // 	  })
			  return publicClient.storeObject('profile', 'me',data);
		      
	          //         }
		  // )
	  
	      },
	      'template' : function(){
		  return publicClient.getFile('template');
	      },
	      'load' : function(){
		  return publicClient.getObject('me');
	      },
	      'deploy' : function(page){
		  return publicClient.storeFile('text/html', 'profile.html', page, false)
	      },
	      'link' : function(){
		  return publicClient.getItemURL('profile.html');
	      }
	   
	  }
      }
  });
