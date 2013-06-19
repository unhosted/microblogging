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
	return func(data[i]);
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
	    f(div, key).innerHTML = t
	}
    );
    return div
}

function get_url(url, callback){
    function reqListener () {
	callback(JSON.parse(this.responseText));
    };
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onload = reqListener;
    request.setRequestHeader('Content-Type', 'aplication/json');
    request.send();
}
