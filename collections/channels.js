Channels = new Meteor.Collection('channels');

Schema = {};

Schema.Channels = new SimpleSchema({
    name: {
        type: String,
        label: "Name",
        max: 50
    },
    color: {
        type: String,
        label: "Color",
        max: 50
    },
	slug: {
        type: String,
        label: "Slug",
        max: 50
    },
	exposed: {
	    type: Boolean,
		label: "Public"
	}
});

Channels.attachSchema(Schema.Channels);

if(Meteor.isClient) {
  Template.channelsList.listOfChannels = function () {
    return Channels.find();
  };
}

if (Meteor.isClient) {
  Meteor.subscribe('channels');
}