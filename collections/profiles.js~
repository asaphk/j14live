Profiles = new Meteor.Collection('profiles');

Schema = {};

Schema.Profiles = new SimpleSchema({
    name: {
        type: String,
        label: "User Name",
        max: 50
    },
    user: {
        type: String,
        label: "User ID",
        max: 50,
		optional: false,
		denyUpdate: true
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

Profiles.attachSchema(Schema.Profiles);

if (Meteor.isClient) {
  Meteor.subscribe('profiles');
}