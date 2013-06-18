
var feeds
var blogpost_template
var post_ids
function init(){
    //remoteStorage.claimAccess('microblog','rw');
    feeds = document.getElementById('feeds');
    post_ids = 0;
    blogpost_template = document.getElementById('blogpost_template');
    aggregate(url);

}


function Post(created_at, content, fullname, screenname){
    this.created_at = created_at;
    this.text = content;
    this.id = post_ids++
    this.fullname = fullname;
    this.screenname = screenname;
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
	    f(item, 'fullname').innerHTML = this.fullname
	    f(item, 'screenname').innerHTML = this.screenname
	    f(item,'tweet').innerHTML = this.text;
	    f(item,'time').innerHTML = this.created_at;
	    feeds.insertBefore(item, feeds.firstElementChild);
	}
	return item;
    }
    this.div();

}
var posts = []
function new_post(data){
    posts.push(new Post(data.created_at, data.text));
}

var url = 'https://heahdk.net/storage/ggrin/public/www/microposts'

function get_items (resp) {
    var items = JSON.parse(this.responseText);
    items.forEach(aggregate_item);
    return items;
}

function aggregate(url){
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onload = get_items;
    request.setRequestHeader('Content-Type', 'aplication/json');
    request.send();
}

function aggregate_item(url){
    function reqListener () {
	new_post(JSON.parse(this.responseText));
    };
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onload = reqListener;
    request.setRequestHeader('Content-Type', 'aplication/json');
    request.send();
}


window.onload = init;
