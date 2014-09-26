import Ember from 'ember';

export default Ember.Controller.extend({
  title: null,
  competency: null,
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  competencies: function(){
    return this.get('programYear.competencies');
  }.property('programYear.competencies.[]'),
  actions: {
    save: function() {
      var self = this;
      var objective = this.store.createRecord('objective', {
        title: this.get('title'),
        programYear: this.get('programYear.model'),
        competency: this.get('competency'),
      });
      objective.save().then(function(objective){
        self.get('programYear').get('objectives').addObject(objective);
        self.transitionToRoute(
          'programyearobjectives',
          self.get('programYear.program'),
          self.get('programYear.model')
        );
      });
    }
  }
});
