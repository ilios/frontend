import Ember from 'ember';

export default Ember.Controller.extend({
  selectedSchool: null,
  currentSchoolObserver: function(){
    var self = this;
    var currentUser = this.get('currentUser');
    if(currentUser){
      currentUser.get('currentSchool').then(function(school){
        self.set('selectedSchool', school);
      });
    }
  }.observes('currentUser.currentSchool').on('init')
});
