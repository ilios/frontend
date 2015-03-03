import Ember from 'ember';

export default Ember.Component.extend({
  subject: null,
  isCourse: false,
  isSession: Ember.computed.not('isCourse'),
  isManagingParents: Ember.computed.notEmpty('currentlyManagedObjective'),
  currentlyManagedObjective: null,
  actions: {
    manageParents: function(objective){
      this.set('currentlyManagedObjective', objective);
    },
    doneManagingParents: function(){
      this.set('currentlyManagedObjective', null);
    }
  }
});
