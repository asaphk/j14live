Channels = new Meteor.Collection('channels');

if (Meteor.isClient) {
  Meteor.subscribe('channels');
}