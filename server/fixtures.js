// Fixture data
if (Meteor.users.find().count() === 0) {
  var editorId = Meteor.users.insert({
    profile: { name: 'Editor' },
	email: "editor@j14l.org.il"
  });
  Roles.addUsersToRoles(editorId, ['editor']);
}

if (Channels.find().count() === 0) {
  Channels.insert({
    name: "J14live",
	title: "The J14Live official",
	color: "yellow"
  });
  Channels.insert({
    name: "Housing",
	title: "All about housing",
	color: "blue"
  });
  Channels.insert({
    name: "Energy",
	title: "The Energy",
	color: "green"
  });
}