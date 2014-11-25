import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ['programsschool'],
  currentSchool: Ember.computed.alias("controllers.programsschool.model"),
  sortAscending: true,
  sortProperties: ['title'],
  currentSchoolObserver: function(){
    var self = this;
    this.get('currentSchool.programs').then(function(programs){
      self.set('model', programs);
    });
  }.observes('currentSchool.programs.@each')
});
