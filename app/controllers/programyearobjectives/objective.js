import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  competencies: function(){
    return this.get('programYear.competencies');
  }.property('programYear.competencies.[]'),
  actions: {
    save: function(){
      this.get('model').save();
    }
  }
});
