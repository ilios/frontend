import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  competencies: function(){
    return this.get('programYear.competencies');
  }.property('programYear.competencies.[]'),
  actions: {
    save: function(){
      this.set('programYear.isDirty', true);
      this.transitionToRoute(
        'programyearobjectives',
        this.get('programYear.program'),
        this.get('programYear.model')
      );
    }
  }
});
