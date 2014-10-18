import Ember from 'ember';

export default Ember.ObjectProxy.extend({
  currentUser: Ember.computed.alias('content'),
  currentSchool: null,
  canChangeSchool: function(){
    return this.get('schools.length') > 1;
  }.property('schools.@each'),
  setCurrentSchool: function(){
    if(this.get('content')){
      var self = this;
      this.get('primarySchool').then(function(school){
        self.set('currentSchool', school);
      });
    }
  }.observes('content').on('init'),
  //will be customizable
  preferredDashboard: 'dashboard.week'
});
