Template.profileUpdate.helpers({
  editingDoc: function editingDocHelper() {
    return Profiles.findOne({user: Session.get("selectedDocId")});
  }
});