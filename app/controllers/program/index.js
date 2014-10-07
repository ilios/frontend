import Ember from 'ember';

export default Ember.ArrayController.extend({
  sortAscending: true,
  sortProperties: ['academicYear'],
  actions: {
    createNewYear: function(){
      var programYear = this.store.createRecord('program-year', {
        program: this.get('program'),
      });
      this.get('model').pushObject(programYear);
    }
  }
});
