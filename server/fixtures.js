// Fixture data
if (Meteor.users.find().count() === 0) {
  var editorId = Meteor.users.insert({
    email: "editor@j14l.org.il"
  });
  Roles.addUsersToRoles(editorId, ['editor']);
}

if (Channels.find().count() === 0) {
  Channels.insert({
    name: "J14live",
	title: "The J14Live official",
	color: "yellow",
	slug: "j14live",
	exposed: true
  });
  Channels.insert({
    name: "Housing",
	title: "All about housing",
	color: "blue",
	slug: "housing",
	exposed: true
  });
  Channels.insert({
    name: "Energy",
	title: "The Energy",
	color: "green",
	slug: "energy",
	exposed: true
  });
  Channels.insert({
    name: "All posts",
    title: "All posts",
    color: "red",
    slug: "all-posts",
    exposed: false
  });
}