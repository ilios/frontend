/* global moment */
import Ember from 'ember';

export default Ember.Controller.extend({
  yearChoice: null,
  academicYearObserver: function(){
    var self = this;
    return this.get('program').get('programYears').then(function(programYears){
      var existingYears = [];
      programYears.forEach(function(programYear){
        existingYears.push(programYear.get('academicYear'));
      });
      var years = [];
      for(var i = 5; i > 0; i--){
        var academicYearBack = moment().subtract(i, 'years').format('YYYY') +
          ' - ' +
          moment().subtract(i-1, 'years').format('YYYY');
        if(existingYears.indexOf(academicYearBack) === -1){
          years.push(academicYearBack);
        }
      }
      for(i = 0; i < 5; i++){
        var academicYearForward = moment().add(i, 'years').format('YYYY') +
          ' - ' +
          moment().add(i+1, 'years').format('YYYY');
        if(existingYears.indexOf(academicYearForward) === -1){
          years.push(academicYearForward);
        }
      }
      self.set('yearChoice', years[4]);
      self.set('academicYears', years);
    });

  }.observes('program.programYears.@each'),
  academicYears: [],
  actions: {
    save: function() {
      var self = this;
      var programYear = this.store.createRecord('program-year', {
        startYear: this.get('yearChoice').substring(0,4),
        program: this.get('program'),
      });
      programYear.save().then(function(programYear){
        self.get('program').get('programYears').addObject(programYear);
        self.transitionToRoute('program', self.get('program'));
      });
    }
  }
});
