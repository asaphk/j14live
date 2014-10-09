Posts = new Meteor.Collection('posts');

var Schemas = {};

Schemas.Posts = new SimpleSchema({
    title: {
        type: String,
        label: "Title",
        max: 200
    },
    excerpt: {
        type: String,
        label: "Excerpt",
        max: 2000,
		autoform: {
		  rows: 5
		}
    },
    url: {
        type: String,
        label: "URL Address"
    },
    videoUrl: {
        type: String,
        label: "Video URL Address",
		optional: true
    },
    img: {
        type: String,
        label: "IMG src",
		optional: true
    },
    feedId: {
        type: String,
        label: "Feed ID"
    },
    originalId: {
    	type: String,
    	label: "ID at feed source"
    },
    userId: {
    	type: String,
		label: "User ID",
    	optional: false
    },
    votes: {
        type: String,
        label: "Votes"
    },
    commentsCount: {
        type: String,
        label: "Comments"
    },
    originalPostDate: {
        type: Date,
        label: "Original Post Date"
    },
    channels: {
        type: [String],
        autoform: {
		  options: function () {
		    return Channels.find().map(function (c) {
			  return {label: c.name, value: c._id};
			});
		  }
		}
    }
});

Posts.attachSchema(Schemas.Posts);

// we listen to this collection,
// and set notifications when new posts arrive:
Posts.after.insert(function (userId, doc) {
  //console.log('new post with id: ' + this._id);
  Profiles.find({channels: {$in: this.channels}}).forEach( function(profile) {
    //console.log(profile);
	Notifications.insert({
      userId: profile.user,
      postId: doc._id,
      commentId: '0',
      commenterName: '0',
      read: false
    });
  });
});

Posts.after.update(function (userId, doc) {
  //console.log('updated post with id: ' + doc._id);
  //console.log(doc);
  Profiles.find({channels: {$in: doc.channels}}).forEach( function(profile) {
    //console.log(profile);
	Notifications.insert({
      userId: profile.user,
      postId: doc._id,
      commentId: '0',
      commenterName: '0',
      read: false
    });
  });
});
