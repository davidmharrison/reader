Meteor.publish("directory", function () {
  return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});

Meteor.publish("feeds", function () {
  return Feeds.find({});
});

Meteor.publish("stories", function () {
  return Stories.find({});
});
