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
	      'keys' : function(){
		  if(!keys){
		      var schemas = publicClient.schemas;
		      keys = Object.keys(schemas[Object.keys(schemas)[0]].properties);
		  }
		  return keys;
	      },
	      'save' : function(data){
		  publicClient.getObject('me').then( 
		       function(old_data){
		   	  keys.forEach( function(k){
		   	      if(data[k]===undefined)
		   		  data[k] = old_data[k]
		   	  })
			   return publicClient.storeObject('profile', 'me',data);
		      
	               }
		  )
	  
	      },
	      'template' : function(){
		  return publicClient.getFile('template');
	      },
	      'load' : function(){
		  return publicClient.getObject('me');
	      },
	      'deploy' : function(){
		  publicClient.getObject('me').then( function(me){
		      var page = ""
		      publicClient.getFile('template').then( function(template){
			  var page = template.data ;
			  Object.keys(me).forEach( function(k) {
			      page = page.replace( new RegExp('(\\$'+key+')'), me[key] )
			  })
		      })
		      return remoteStorage.www.up('profile.html', 
						  'text/html', 
						  page)
		  })
	      },
	      /*'link' : function(){
		  return publicClient.getItemURL('profile.html');
	      },*/
	      'onchange' : function(callback){
		  return publicClient.on('change', callback);
	      }
	   
	  }
      }
  });
