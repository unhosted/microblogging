function set_profile(){
    var profile_keys = ['screenname','name','description','location']
    get_url(  options.base_url+'/profile/me',
	      function(profile){
		  fill_div(profile_div, profile_keys, profile);
		  f(profile_div,'profile_img').src = 
		      profile.profile_image_url;
		  f(profile_div, 'homepage').href = profile.homepage;
		  profile_data = profile;
	      }
	   )


}
