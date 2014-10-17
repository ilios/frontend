import Ember from 'ember';

export default Ember.ArrayController.extend({
  sortAscending: true,
  sortProperties: ['title'],
  currentSchoolObserver: function(){
    var self = this;
    this.get('currentUser.currentSchool.programs').then(function(programs){
      self.set('model', programs);
    });
  }.observes('currentUser.currentSchool')
});
