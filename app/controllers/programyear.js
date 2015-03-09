import Ember from 'ember';

export default Ember.ObjectController.extend({
  isDirty: false,
  actions:{
    save: function(){
      var self = this;

      var saveArr = [];
      this.get('model.objectives').forEach(function(objective){
        saveArr.push(objective.save());
      });
      saveArr.push(this.get('model').save());

      Ember.RSVP.all(saveArr).then(function(){
        self.set('isDirty', false);
      });
    }
  }
});
