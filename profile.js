function set_profile(){
    var profile_keys = ['screenname','name','description','location']
    get_url(  options.base_url+'/profile/me',
	      function(profile){
		  fill_div(profile_div, profile_keys, profile);
		  forEach( profile_keys, 
			   function(e){
			       f(profile_div, e).addEventListener('change', profile_onchange);
			   }
			 )
		  f(profile_div,'profile_img').src = 
		      profile.profile_image_url;
		  f(profile_div, 'homepage').href = profile.homepage;
		  profile_data = profile;
	      }
	   )


}

function profile_onchange(val){
    profile_data[val] = f(profile_div, val).innerHTML;
}
