

RemoteStorage.defineModule('credentials-sockethub', function(privateClient, publicClient){
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
  return {
    'exports' : {
      'store' : function(name, data){
        console.log('storing sockethub credentials',name,data);
	return privateClient.storeObject('sockethub', 
                                         name, 
                                         data);
      },
      'get' : function(name){
	return privateClient.getObject(name);
      },
      'onchange' : function(callback){
        return privateClient.on('change', callback);
      }
    }
  }
});

RemoteStorage.defineModule('credentials-twitter', function(privateClient, publicClient){
  privateClient.declareType('twitter', {
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
  return {
    'exports' : {
      'store' : function(name, data){
	return privateClient.storeObject('twitter', name, data);
      },
      'get' : function(name){
	return privateClient.getObject(name);
      },
      'onchange' : function(callback){
        return privateClient.on('change', callback);
      }
    }
  }
});

