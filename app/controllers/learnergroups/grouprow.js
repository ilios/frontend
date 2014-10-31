import Ember from 'ember';

export default Ember.ObjectController.extend({
  bufferedTitle: Ember.computed.oneWay('title'),
  actions: {
    save: function(){
      var self = this;
      var bufferedTitle = this.get('bufferedTitle').trim();
      var learnerGroup = this.get('model');
      learnerGroup.set('title', bufferedTitle);
      learnerGroup.save().then(function(){
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
