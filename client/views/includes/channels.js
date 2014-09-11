if(Meteor.isClient) {
  Template.channelsList.listOfChannels = function () {
    console.log('ha?');
    return Channels.find();
  };
}