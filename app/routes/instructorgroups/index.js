import Ember from 'ember';

export default  Ember.Route.extend({
  model: function() {
    return this.get('currentUser.currentSchool').then(function(school){
      return school.get('instructorGroups');
    });
  }
});
