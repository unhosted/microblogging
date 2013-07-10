
function Post(data){
  if(!data){
    data = {};
  }
  //this.data = data
  //done in fill_post
  this.gui_post_id = gui_post_ids++
  this.post_id = data.post_id;


  this.fill_post = function(item, data){
    //console.log('fill_post', item, data)
    if(!item)
      item = this.div;
    if(typeof(data.avatar) === 'undefined'){
      data.avatar = ''
    }
    this.data = data;
    
    item.dataset.date = data.date;
    //item.dataset.post_id = data.post_id;
    //item.dataset.gui_post_id = this.gui_post_id;
    //happens in display(need to run only once values should never change)
    f(item,'screenname').textContent = data.screenname;
    f(item,'fullname').textContent = data.fullname;
    f(item,'text').textContent = data.text;
    f(item,'created_at').textContent = (new Date(data.date)).toString();
    f(item, 'avatar').src = data.avatar;
    
    f(item, 'delete').onclick = function(){
      delete_post(data);
    }
    f(item, 'syndicate').onclick = function(){
      console.log('onclick')
      if(!data.twitter_id && sockethubClient){
        syndicate_to_twitter(data);
      }
    }

    if(data.twitter_id){
      add_class(item, 'syndicated')
    }
    
  }
    
  
  this.display = function(){
    var item = this.div
    if(!item) {
      console.log("creating new Post : ", this.gui_post_id)
      item = blogpost_template.cloneNode(true);
      item.id = "";
      item.dataset.gui_post_id = data.gui_post_id;
      item.dataset.post_id = data.post_id;
      this.fill_post(item, data);

      var next_element = feed_div.firstElementChild;
      forEach(feed_div.getElementsByClassName('blogpost'), function(older_post){
        if(older_post.dataset.date > data.date)
          next_element = older_post;
      })
      feed_div.insertBefore(item, next_element);
      this.div = item;
    }           

    return item;
  }

  this.to_atom = function(){
    var feed = ""
    feed += tag (  'entry',
		   tag(  'author', 
			 tag(  'name',this.fullname) + 
			 tag(  'email', this.screenname )
		      ) +
		   tag(  'updated', this.created_at) +
		   tag(  'summary', this.text )
		);
    return feed;
  }
    
  this.display();
}

function new_post(data){
  posts.push(new Post(data));
}
