import Ember from 'ember';

export default Ember.ObjectController.extend({
  bufferedTitle: Ember.computed.oneWay('title'),
  actions: {
    save: function(){
      var self = this;
      var bufferedTitle = this.get('bufferedTitle').trim();
      var instructorGroup = this.get('model');
      instructorGroup.set('title', bufferedTitle);
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
