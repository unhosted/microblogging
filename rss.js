

function feed(data,format){
    if(format == "atom" || !format)
	return	 atom_feed(data);
}


function tag(key, value){
    return '<'+key+'>\n'+value+'\n</'+key+'>\n'
}

function a_tag(name, data){
    var ignore = ["innerHTML"];
    var ret = ""
    ret += '<'+name+ ' '
    forEach(  data.keys,
	      function(key){
		  if(ignore.indexOf(key) >= 0)
		      ret += key + '="' + data[key] +'" ';
	      }
	   )
    ret += '>' + data.innerHTML + '</' + name + '>\n';
    return ret;
}

function atom_feed(data){
    var feed = ""
    var props = ['title','subtitle','id','updated']
    feed += atom_head();
    props.forEach( 
	function(key){
	    var value;
	    if(value = data[key]) {
		feed += tag(key,value)
	    }
	}
    )
    var links
    if(links = data.links){
	forEach(links,
	    function(link){
		feed += a_tag('link',link);
	    }
	)
    }
    var entries;
    if(entries = data.entries){
	forEach(entries, 
		function(entrie){
		    feed += entrie.to_atom();
		}

	       )
    }
    feed += atom_close()
    return feed;
}


function atom_head(){
    return '<?xml version="1.0" encoding="utf-8"?>\n'+
            '<feed xmlns="http://www.w3.org/2005/Atom">\n'
 
}

function atom_close(){
    return '</feed>\n'
}
