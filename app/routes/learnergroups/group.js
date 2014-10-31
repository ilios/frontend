import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    var self = this;
    return this.store.find('learner-group', params.learner_group_id).then(function(model){
      return model.get('cohort').then(function(cohort){
          self.set('currentUser.currentCohort', cohort);
          return model;
      });
    });
  }
});
