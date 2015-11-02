import Ember from 'ember';
import DS from 'ember-data';
import ajax from 'ic-ajax';

const { computed } = Ember;

export default Ember.Service.extend({
  store: Ember.inject.service(),
  currentUserId: null,
  model: function(){
    let deferred = Ember.RSVP.defer();
    let currentUserId = this.get('currentUserId');
    if (!currentUserId) {
      var url = '/auth/whoami';
      ajax(url).then(data => {
        if(data.userId){
          this.set('currentUserId', data.userId);
          this.get('store').find('user', data.userId).then(function(user){
            deferred.resolve(user);
          });
        } else {
          deferred.resolve(null);
        }
      });
    } else {
      this.get('store').find('user', currentUserId).then(function(user){
        deferred.resolve(user);
      });
    }

    return DS.PromiseObject.create({
      promise: deferred.promise
    });
  }.property('currentUserId'),
  availableCohortsObserver: function(){
    var self = this;
    this.get('availableCohorts').then(function(cohorts){
      if(!cohorts.contains(self.get('currentCohort'))){
        self.set('currentCohort', null);
      }
    });
  }.observes('availableCohorts.@each'),
  currentCohort: null,
  availableCohorts: function(){
    var self = this;
    return new Ember.RSVP.Promise(function(resolve) {
      self.get('currentSchool').then(function(school){
        school.get('programs').then(function(programs){
          var promises = programs.map(function(program){
            return program.get('programYears');
          });
          Ember.RSVP.hash(promises).then(function(hash){
            var promises = [];
            Object.keys(hash).forEach(function(key) {
              hash[key].forEach(function(programYear){
                promises.push(programYear.get('cohort'));
              });
            });
            Ember.RSVP.hash(promises).then(function(hash){
              var cohorts = Ember.A();
              Object.keys(hash).forEach(function(key) {
                cohorts.pushObject(hash[key]);
              });
              resolve(cohorts);
            });
          });
        });
      });
    });
  }.property('currentSchool'),
  //will be customizable
  preferredDashboard: 'dashboard.week',
  canViewCourses: computed('model', function(){
    return false;
  })
});
