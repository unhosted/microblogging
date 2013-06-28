remoteStorage.defineModule('sockethubcredentials', 
    function(privateClient, publicClient){
	privateClient.declareType('sockethub', {
	    'type' : 'object',
	    'properties' : {
		'host' : {
		    'type' : 'string'
		},
		'port' : {
		    'type' : 'integer'
		},
		'ssl' : {
		    'type' : 'boolean'
		},
		'register' : {
		    'type' : 'object',
		    'properties' : {
			'secret' : {
			    'type' : 'string'
			}
		    }
		}
	    }
	})
	var keys = undefined;
	return {
	    'exports' : {
		'keys' : function(){
		    if(!keys){
			var shemas = privateClient.schemas;
			keys = Object.keys(shemas[Object.keys(shemas)[0]].properties);
		    }
		    return keys;
		},
		'store' : function(name, data){
		    return privateClient.storeObject('sockethub', name, data);
		    
		},
		'get' : function(name){
		    return privateClient.getObject(name);
		}
	    }
	}
    });

remoteStorage.defineModule('twittercredentials', 
  function(privateClient, publicClient){
      privateClient.declareType('sockethub', {
	  'type' : 'object',
	  'properties' : {
	      'username' : {
		  'type' : 'string'
	      },
	      'consumer_key' : {
		  'type' : 'string'
	      },
	      'consumer_secret' : {
		  'type' : 'string'
	      },
	      'access_token' : {
		  'type' : 'string'
	      },
	      'access_token_secret' : {
		  'type' : 'string'
	      }
	  }
      })
      var keys = undefined;
      return {
	  'exports' : {
	      'keys' : function(){
		  if(!keys){
		      var shemas = publicClient.schemas;
		      keys = Object.keys(shemas[Object.keys(shemas)[0]].properties);
		  }
		  return keys;
	      },
	      'store' : function(name, data){
		  return privateClient.storeObject('sockethub', name, data);
		  
	      },
	      'get' : function(name){
		  return privateClient.getObject(name);
	      }
	  }
      }
  });
