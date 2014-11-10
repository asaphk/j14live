Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { 
    return [Meteor.subscribe('notifications')];
  }
});

PostsListController = RouteController.extend({
  template: 'postsList',
  increment: 4, 
  limit: function() { 
    return parseInt(this.params.postsLimit) || this.increment; 
  },
  findOptions: function() {
    return {sort: this.sort, limit: this.limit()};
  },
  onBeforeAction: function() {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },
  posts: function() {
    return Posts.find({}, this.findOptions());
  },
  data: function() {
    var hasMore = this.posts().count() === this.limit();
    return {
      posts: this.posts(),
      ready: this.postsSub.ready,
      nextPath: hasMore ? this.nextPath() : null
    };
  }
});
/** used for main page **/
NewPostsListController = PostsListController.extend({
  sort: {submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.newPosts.path({postsLimit: this.limit() + this.increment});
  },
  posts: function() {
    return Posts.find({channels: "T9NN6XMPMKmKW53pE"}, this.findOptions());
  }
});

BestPostsListController = PostsListController.extend({
  sort: {votes: -1, submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.bestPosts.path({postsLimit: this.limit() + this.increment});
  }
});

NewPostsListByChannelController = PostsListController.extend({
  sort: {submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.postsChannel.path({_id: this._id, postsLimit: this.limit() + this.increment});
  }, 
  posts: function() {
    //console.log(this);
    return Posts.find({channels: this.params._id});
  }
});

NewPostsListByEditorController = PostsListController.extend({
  sort: {submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.myChannels.path({_id: this._id, postsLimit: this.limit() + this.increment});
  },
  waitOn: function() {
      return [
        Meteor.subscribe('profiles')
      ];
  },
  onBeforeAction: function() {
    Meteor.subscribe('posts');
    Meteor.subscribe('profiles');
  },
  posts: function() {
	//editorProfile = Profiles.findOne({user: Meteor.userId()});
	//console.log(editorProfile);
	//editorChannels = editorProfile.channels;
	//console.log(editorChannels);
    //return Posts.find({channels: {$in: editorChannels}});
    //return Posts.find({});
	
    return Posts.find({channels: {$in: Profiles.findOne({user: Meteor.userId()}).channels}});
  }
});

Router.map(function() {
  this.route('home', {
    path: '/',
    controller: NewPostsListController
  });
  
  this.route('newPosts', {
    path: '/new/:postsLimit?',
    controller: NewPostsListController
  });
  
  this.route('bestPosts', {
    path: '/best/:postsLimit?',
    controller: BestPostsListController
  });
  
  this.route('postPage', {
    path: '/posts/:_id',
    waitOn: function() {
      return [
        Meteor.subscribe('singlePost', this.params._id),
        Meteor.subscribe('comments', this.params._id)
      ];
    },
    data: function() { return Posts.findOne(this.params._id); }
  });

  this.route('postEdit', {
    path: '/posts/:_id/edit',
    waitOn: function() { 
      return [
	    Meteor.subscribe('singlePost', this.params._id),
	    Meteor.subscribe('channels'),
      ];
    },
    data: function() { 
	  Session.set('selectedDocId', this.params._id);
	  return Posts.findOne(this.params._id);
	}
  });
  
  this.route('postsChannel', {
    path: '/posts-list/:_id/:postsLimit?',
	controller: NewPostsListByChannelController
  });

  this.route('myChannels', {
    path: '/my-channel/:postsLimit?',
	controller: NewPostsListByEditorController
  });

  this.route('postSubmit', {
    path: '/submit',
    progress: {enabled: false}
  });

  this.route('profileUpdate', {
    path: '/update-profile/:_id/edit',
    waitOn: function() { 
      return [
	    Meteor.subscribe('singleProfile', this.params._id),
	    Meteor.subscribe('channels'),
      ];
    },
    data: function() { 
	  Session.set('selectedDocId', this.params._id);
	  return Profiles.findOne({user: this.params._id});
	}
  });

  this.route('loginPage', {
    path: '/login',
    progress: {enabled: false}
  });
  
  // mapping a route for processing
  // incoming posts in db:
  this.route('processDb', {
    path: '/processdb',
    where: 'server',

    action: function () {
	  // Process info from DB
	  // Todo:
	  // 1. limit items per time
	  // 2. make flagging as processed work
	  
	  
	  // Process our Instagram database:
      Instagram = new Meteor.Collection("instagram");
      Instagram.find({processed: {$ne: "yes"}}).forEach( function(myDoc) {
        Posts.insert({
          title: myDoc.caption.text,
          url: myDoc.link,
		  img: myDoc.images.low_resolution.url,
		  body: myDoc.caption.text,
		  orig: "instagram",
		  sourceId: myDoc.caption.id,
          userId: "mavCYCmPZfRxBzYRk",
          author: "Ako",
          commentsCount: "0",
          votes: "0",
        });
		// flag as processed:
		Instagram.update(
		  {id: myDoc.id},
          {$set: {processed: "yes"}},
          {multi: true});
      });
	  
	  
	  // Process Tweets:
      Tweets = new Meteor.Collection("tweets");
      Tweets.find({processed: {$ne: "yes"}}).forEach( function(myDoc) {
	    //console.log(myDoc);
		
		var imgUrl = "";
		if (myDoc.entities.media) {
		  var mediaObject = myDoc.entities.media;
		  var mediaArray = mediaObject.split("\n");
		  var mediaSliced = mediaArray[5].split(": ");
		  var imgUrl = mediaSliced[1];
		}
		
        Posts.insert({
          title: myDoc.text,
          url: myDoc.url,
		  img: imgUrl,
		  body: myDoc.text,
		  orig: "tweeter",
		  sourceId: myDoc.id,
          userId: "mavCYCmPZfRxBzYRk",
          author: "Ako",
          commentsCount: "0",
          votes: "0",
        });
		// flag as processed:
		Tweets.update(
		  {id: myDoc.id},
          {$set: {processed: "yes"}},
          {multi: true});
      });
	  
	  // Process FB Posts:
      Fposts = new Meteor.Collection("fbposts");
      Fposts.find({processed: {$ne: "yes"}}).forEach( function(myDoc) {
	    //console.log(myDoc);

		imgUrl = "";
		postUrl = "";
		// switch by type:
		if (myDoc.type == "status") {
		  postTitle = myDoc.message;
		  postBody = myDoc.message;
		  if (myDoc.first_action) {
		    postUrl = myDoc.first_action.link;
		  }
		}
		else if (myDoc.type == "link") {
		  postTitle = myDoc.story;
		  postBody = myDoc.message;
		  if (myDoc.first_action) {
		    postUrl = myDoc.first_action.link;
		  }
		}
		else if (myDoc.type == "photo") {
		  postTitle = myDoc.story;
		  postBody = myDoc.message;
		  if (myDoc.first_action) {
		    postUrl = myDoc.first_action.link;
		  }
		  imgUrl = myDoc.picture;
		}
		else if (myDoc.type == "video") {
		  postTitle = myDoc.name;
		  postBody = myDoc.description;
		  if (myDoc.first_action) {
		    postUrl = myDoc.first_action.link;
		  }
		  imgUrl = myDoc.picture;
		}
		else {
		  console.log("Oops! FB post of unknown type: " + myDoc.type);
		}
		
		
        Posts.insert({
          title: postTitle,
          url: postUrl,
		  img: imgUrl,
		  body: postBody,
		  orig: "facebook",
		  sourceId: myDoc.id,
          userId: "mavCYCmPZfRxBzYRk",
          author: "Ako",
          commentsCount: "0",
          votes: "0",
        });
		// flag as processed:
		Fposts.update(
		  {id: myDoc.id},
          {$set: {processed: "yes"}},
          {multi: true});
      });
	  
	  // if server, return a JSON response:
	  if (Meteor.isServer) {
        resp = {'success' : 'true'};
        this.response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        this.response.end(JSON.stringify(resp));
	  }
	  if (Meteor.isClient) {
	    console.log("yep, updated posts. nice!");
	  }
    }
  });
});

var requireLogin = function(pause) {
  if (! Meteor.user()) {
    if (Meteor.loggingIn())
      this.render(this.loadingTemplate);
    else
      this.render('accessDenied');
    
    pause();
  }
};

if (Meteor.isClient) {
  Router.onBeforeAction('loading');
  Router.onBeforeAction(requireLogin, {only: 'postSubmit'});
  Router.onBeforeAction(function() { clearErrors() });
};
