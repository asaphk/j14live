Template.postEdit.helpers({
  editingDoc: function editingDocHelper() {
    return Posts.findOne({_id: Session.get("selectedDocId")});
  }
});