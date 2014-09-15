Posts = new Meteor.Collection('posts');


var Schemas = {};

Schemas.Posts = new SimpleSchema({
    title: {
        type: String,
        label: "Title",
        max: 200
    },
    body: {
        type: String,
        label: "Body",
        max: 3000
    },
    url: {
        type: String,
        label: "URL Address"
    },
    img: {
        type: String,
        label: "IMG src",
    },
    orig: {
        type: String,
        label: "Original Source"
    },
    sourceId: {
    	type: String,
    	label: "ID at source"
    },
    userId: {
    	type: String,
    	optional: false
    },
    votes: {
        type: String,
        label: "Original Source"
    },
    commentsCount: {
        type: String,
        label: "Original Source"
    },
    lastCheckedOut: {
        type: Date,
        label: "Last date this book was checked out",
        optional: true
    },
    summary: {
        type: String,
        label: "Brief summary",
        optional: true,
        max: 1000
    },
    published: {
    	type: Boolean,
    	label: "Published",
    	optional: true,
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