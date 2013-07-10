function post_by_id(post_id){
    return list_first(posts, function(post){
	return post.post_id == post_id;
    })
}

function list_first(items, func){
    var len = items.length
    for(var i = 0; i < len; i++){
	if(func(items[i])){
	    return items[i];
	}
    }
    return undefined;
}

function forEach(data, func){
    var len = data.length
    for(var i = 0; i < len; i++){
	func(data[i]);
    }
}

function f(element, className){
    return element.getElementsByClassName(className)[0];
}


function args_to_object(str){
    return str.slice(1).split('&').reduce( 
	function(m, el){ 
	    var set = el.split('=');
	    m[decodeURIComponent(set[0])]=decodeURIComponent(set[1]); 
	    return m  
	}, {});

}

function fill_div(div,props, data){
    props.forEach(
	function(key){
	  var t;
	  if(!( t = data[key] ) ){
	    t = '';
	  }
          var i = f(div, key)
          if(i)
            i.innerHTML = t;
	}
    );
    return div
}

function get_url(url, callback){
  function reqListener () {
    if( this.status == 200 ){
      callback(JSON.parse(this.responseText));
    }
    else{
      console.error("HTTPRequest failed with : ",this.status,this);
    }
  };
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.onload = reqListener;
  request.setRequestHeader('Content-Type', 'aplication/json');
  
  request.send();
  
}

function add_class(item, className){
  return item.className = item.className.split(' ').concat([className]).join(' ');
}
function remove_class(item, className){
  return item.className = item.className.split(' ').filter(function(t){
    return t != className;
  }).join(' ');
}

function toggle(e){
  console.log('toggling',e)
  if(e.className.indexOf('expanded') > 0)
    remove_class(e,'expanded')
  else
    add_class(e, 'expanded');
}
