Template.notifications.helpers({
  notifications: function() {
    return Notifications.find({userId: Meteor.userId(), read: false});
  },
  notificationCount: function(){
  	return Notifications.find({userId: Meteor.userId(), read: false}).count();
  }
});

Template.notification.helpers({
  notificationPostPath: function() {
    return Router.routes.postPage.path({_id: this.postId});
  },
  notificationPostTitle: function() {
    return Posts.findOne({_id: this.postId}).title;
  }
})

Template.notification.events({
  'click a': function() {
    Notifications.update(this._id, {$set: {read: true}});
  }
})