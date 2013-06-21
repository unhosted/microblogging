

function Post(data){
    var props = ['created_at',  'text', 'fullname', 'screenname']
    data.created_at = (new Date(data['date'])).toString();
    Object.keys(data).forEach(function(key){
	var t;	
	if( !( t = data[key] ) )
	    t = '';
	this[key] = t;
    }.bind(this));

    this.id = post_ids++

    this.div = function(){
	var item = list_first(
	    document.getElementsByClassName('blogpost'),
	    function(item){
		return (item.dataset['id'] == this.id);
	    }.bind(this)
	)
	
	if(!item) {
	    console.log("creating new Post : ", this.id)
	    item = blogpost_template.cloneNode(true);
	    item.id = "";
	    item.dataset.id = this.id;
	    item.dataset.uuid = this.uuid;
	    f(item, 'delete').onclick = function(){
		delete_post(this)
	    }.bind(this)
	    fill_div(item, props, this);
	    feeds_div.insertBefore(item, feeds.firstElementChild);
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

    this.div();

}
