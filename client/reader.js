//

Meteor.subscribe("directory");
Meteor.subscribe("feeds");

Meteor.Router.add({
	'/': 'index'
});

// If no party selected, select one.
Meteor.startup(function () {
  Deps.autorun(function () {
    if (! Session.get("selected")) {
      var feed = Feeds.findOne();
      if (feed) {
        Session.set("feed", feed._id);
	}
    }
  });
});

Template.feeds.feeds = function(){
	return Feeds.find();
};


Template.index.feed = function(){
	return Feeds.findOne(Session.get('feedId'));
};

Template.feed.stories = function() {	
	feed = Feeds.findOne(Session.get('feedId'));
	Meteor.call("getFeed",{url:feed.url,feedId:feed._id},function(error, result){
 
 	});
	return Stories.find({feed_id:feed._id},{sort:{"pubDate":-1}});
}

Template.feeds.addFeed = function() {
	return true;
}

Template.feeds.rendered = function(){
//	console.log(this);
};

Template.feeds.events({
	'click .feed': function(event,template) {
		Session.set('feedId',this._id);
	},
	'click .addFeed': function(event,template){
		Meteor.call("addFeed",{
			url: template.find("#url").value
		});
	}
});