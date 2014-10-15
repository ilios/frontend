import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    save: function(){
      var self = this;
      var instructorGroup = this.get('model');
      instructorGroup.save().then(function(){
        if(!self.get('isDestroyed')){
          self.set('isEditing', false);
        }
      });
    },
    removeGroup: function(group){
      group.destroyRecord();
    },
    cancelRemoveGroup: function(){
      this.get('confirmRemoveModal').send('toggleVisibility');
    }
  }
});
