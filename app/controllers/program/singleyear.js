/* global moment */
import Ember from 'ember';

export default Ember.ObjectController.extend({
  bufferedAcademicYear: Ember.computed.oneWay('model.academicYear'),
  isEditing: false,
  isEditingObserver: function(){
    var programyear = this.get('model');
    if(programyear && programyear.get('isNew') && programyear.get('startYear') == null){
      this.set('startYear', this.get('academicYears').get('lastObject').substring(0,4));
      this.set('isEditing', true);
    }
  }.observes('model').on('init'),
  academicYears: function(){
    var self = this;
    var years = Ember.A();
    var existingYears = [];
    this.get('parentController.model').forEach(function(programYear){
      existingYears.push(programYear.get('academicYear'));
    });
    var startingYear = parseInt(moment().subtract(5, 'years').format('YYYY'));
    for(var i = 0; i < 10; i++){
        var academicYear = (startingYear+i) + ' - ' + (startingYear+i+1);
        years.pushObject(academicYear);
    }

    return years.filter(function(year){
      if(self.get('academicYear') === year){
        return true;
      }
      if(existingYears.indexOf(year) === -1){
        return true;
      }

      return false;
    });
  }.property('model.@each'),
  actions: {
    edit: function(){
      this.set('isEditing', true);
    },
    save: function(){
      var self = this;
      var bufferedAcademicYear = this.get('bufferedAcademicYear').trim();
      var programYear = this.get('model');
      programYear.set('startYear', bufferedAcademicYear.substring(0,4));
      programYear.save().then(function(){
        if(!self.get('isDestroyed')){
          self.set('isEditing', false);
        }
      });
    }
  }
});
