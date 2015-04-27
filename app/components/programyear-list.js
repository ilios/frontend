/* global moment */
import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  program: null,
  programYears: [],
  classNames: ['detail-view', 'programyear-list'],
  sortBy: ['academicYear'],
  sortedContent: Ember.computed.sort('programYears', 'sortBy'),
  newProgramYears: [],
  existingStartYears: Ember.computed.mapBy('programYears', 'startYear'),
  availableProgramStartYears: function(){
    var firstYear = parseInt(moment().subtract(5, 'years').format('YYYY'));
    var years = [];
    for(var i = 0; i < 10; i++){
      years.pushObject(firstYear+i);
    }
    return years.filter(
      year => {
          return !this.get('existingStartYears').contains(year.toString());
      }
    );
  }.property('existingStartYears.@each'),
  actions: {
    addNewProgramYear: function(){
      var programYear = this.get('store').createRecord('program-year');
      this.get('newProgramYears').addObject(programYear);
    },
    saveNewProgramYear: function(newProgramYear){
      var self = this;
      this.get('newProgramYears').removeObject(newProgramYear);
      var program = this.get('program');
      newProgramYear.set('program', program);
      newProgramYear.save().then(function(savedProgramYear){
        program.get('programYears').addObject(savedProgramYear);
        var cohort = self.get('store').createRecord('cohort', {
          programYear: savedProgramYear
        });
        cohort.save();
        program.save();
      });
    },
    removeNewProgramYear: function(newProgramYear){
      this.get('newProgramYears').removeObject(newProgramYear);
    },
  }
});
