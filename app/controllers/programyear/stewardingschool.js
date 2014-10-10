import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions:{
    remove: function(school){
      this.get('programYear.stewardingSchools').removeObject(school);
      this.set('programYear.isDirty', true);
    },
    add: function(school){
      this.get('programYear.stewardingSchools').then(function(schools){
        schools.addObject(school);
      });
      this.set('programYear.isDirty', true);
    },
  }
});
