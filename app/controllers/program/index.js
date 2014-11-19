import Ember from 'ember';

export default Ember.ArrayController.extend({
  sortAscending: true,
  sortProperties: ['academicYear'],
  actions: {
    createNewYear: function(){
      var programYear = this.store.createRecord('program-year', {
        program: this.get('program'),
      });
      var cohort = this.store.createRecord('cohort', {
        programYear: programYear
      });
      programYear.set('cohort', cohort);
      this.get('model').pushObject(programYear);
    }
  }
});
