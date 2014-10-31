import Ember from 'ember';

export default  Ember.Route.extend({
  model: function() {
    var promises = {};
    var currentCohort = this.get('currentUser.currentCohort');
    if(currentCohort){
      promises.groups = currentCohort.get('topLevelLearnerGroups');
    }
    promises.cohorts = this.get('currentUser.availableCohorts');
    return Ember.RSVP.hash(promises);
  },
  setupController: function(controller, hash){
    if(hash.hasOwnProperty('groups')){
      controller.set('model', hash.groups);
    }
    var sorted = hash.cohorts.sort(function(a,b){
      return Ember.compare(a.get('displayTitle'),b.get('displayTitle'));
    });
    controller.set('arrangedAvailableCohorts', sorted);
  }
});
