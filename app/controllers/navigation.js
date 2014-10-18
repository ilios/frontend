import Ember from 'ember';

export default Ember.Controller.extend({
  schoolTitle: '',
  schoolTitleObserver: function(){
    var self = this;    
    var currentUser = this.get('currentUser');
    if(currentUser){
      currentUser.get('currentSchool').then(function(school){
        self.set('schoolTitle', school.get('title'));
      });
    }

  }.observes('currentUser.currentSchool.title').on('init')
});
