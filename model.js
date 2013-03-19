Feeds = new Meteor.Collection("feeds");
Stories = new Meteor.Collection("stories");

Feeds.allow({
	insert: function(userId,feed) {
		return false;
	},
	update: function(){
		return true;
	},
	remove: function(){
		return true;
	}
});

if(Meteor.is_server){
	
	var require = __meteor_bootstrap__.require;
	libxmljs = require("libxmljs");
	
	// Changes XML to JSON
	function xmlToJson(xml) {
	
		// Create the return object
		var obj = {};

		if (xml.nodeType == 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { // text
			obj = xml.nodeValue;
		}

		// do children
		if (xml.hasChildNodes()) {
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof(obj[nodeName]) == "undefined") {
					obj[nodeName] = xmlToJson(item);
				} else {
					if (typeof(obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(xmlToJson(item));
				}
			}
		}
		return obj;
	};
	
	Meteor.methods({
		getFeed: function (options) {
		  this.unblock();
		  Meteor.http.get(options.url,function(error,res){
			  if(error) {
				  console.log(error);
			  }
			  if(options.url.indexOf("xml")>=0) { 
			   	xmlDoc = libxmljs.parseXmlString(res.content);
			   	if(xmlDoc.find("//channel")[0]) items = xmlDoc.find("//channel")[0].childNodes()[0].find("//item");
				else items = xmlDoc.find("//feed")[0].childNodes()[0].find("//entry");
//				console.log(xmlToJson(items[0].childNodes()));	
				for(i=0;i<items.length;i++) {
					data = {};
					data.feed_id = options.feedId;
					for(j=0;j<items[i].childNodes().length;j++) {
						data[items[i].childNodes()[j].name()] = items[i].childNodes()[j].text();
					}
					matches = Stories.find({pubDate:data.pubDate,title:data.title});
					if(matches.count()>0) return false;
					storyid = Stories.insert(data);
					Feeds.update({_id:feedId},{$addToSet: {stories: storyid}});
				}
			  } else if(options.url.indexOf("json")>=0) {
			  	
			  }
			  return true;
		  });
		},
		addFeed: function(options){
			this.unblock();
			if(!(typeof options.url == "string") && options.url.length) return false;
		
		  Meteor.http.get(options.url,function(error,res){
			  if(error) {
				  console.log(error);
			  }
			   if(options.url.indexOf("xml")>=0) {
				   xmlDoc = libxmljs.parseXmlString(res.content);
				   if(xmlDoc.find("//channel")[0]) title = xmlDoc.find("//channel")[0].childNodes()[0].find("//title")[0].text();
				   else title = xmlDoc.find("//feed")[0].childNodes()[0].find("//title")[0].text();
			   } else if(options.url.indexOf("json")>=0) title = JSON.parse(res.content).metadata.title;
		  
	  		return Feeds.insert({
	  			url: options.url,
	  			title: title
	  		}); 
		  });
		}
	});
};