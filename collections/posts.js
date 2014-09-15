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
        max: 3000,
		autoform: {
		  rows: 10
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
        label: "Feed ID",
		denyUpdate: true
    },
    originalId: {
    	type: String,
    	label: "ID at feed source",
		denyUpdate: true
    },
    userId: {
    	type: String,
    	optional: false
    },
    votes: {
        type: String,
        label: "Votes",
		denyUpdate: true
    },
    commentsCount: {
        type: String,
        label: "Comments",
		denyUpdate: true
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

Posts.allow({
  update: ownsDocument,
  remove: ownsDocument
});

Posts.deny({
  update: function(userId, post, fieldNames) {
    // may only edit the following two fields:
    return (_.without(fieldNames, 'url', 'title', 'channels').length > 0);
  }
});

Meteor.methods({
  post: function(postAttributes) {
    var user = Meteor.user(),
      postWithSameLink = Posts.findOne({url: postAttributes.url});
    
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to post new stories");
    
    // ensure the post has a title
    if (!postAttributes.title)
      throw new Meteor.Error(422, 'Please fill in a headline');
    
    // check that there are no previous posts with the same link
    if (postAttributes.url && postWithSameLink) {
      throw new Meteor.Error(302, 
        'This link has already been posted', 
        postWithSameLink._id);
    }
    
    // pick out the whitelisted keys
    var post = _.extend(_.pick(postAttributes, 'url', 'title', 'message','channels'), {
      userId: user._id, 
      author: user.username, 
      submitted: new Date().getTime(),
      commentsCount: 0,
      upvoters: [], votes: 0
    });
    
    var postId = Posts.insert(post);
    
    return postId;
  },
  
  upvote: function(postId) {
    var user = Meteor.user();
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to upvote");
    
    Posts.update({
      _id: postId, 
      upvoters: {$ne: user._id}
    }, {
      $addToSet: {upvoters: user._id},
      $inc: {votes: 1}
    });
  }
});