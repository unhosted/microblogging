function init_remotestorage(){
    remoteStorage.claimAccess(
	{
	    'microblog':'rw',
	    'profile':'rw'
	});
    
}
