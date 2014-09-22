Accounts.onCreateUser(function(options, user) {
  // We still want the default hook's 'profile' behavior.
  //if (options.profile) {
  //  user.profile = options.profile;
  //}
  //console.log('created new user: ' + user._id);
  
  Profiles.insert({
     name: user._id,
     user: user._id,
     channels: []
  });
  
  return user;
});