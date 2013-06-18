function list_first(items, func){
    var len = items.length
    for(var i = 0; i < len; i++){
	if(func(items[i])){
	    return items[i];
	}
    }
    return undefined;
}

function f(element, className){
    return element.getElementsByClassName(className)[0];
}
