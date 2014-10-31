import Ember from 'ember';

export default Ember.ObjectProxy.extend({
  strore: null,
  currentUser: Ember.computed.alias('content'),
  currentSchoolBuffer: null,
  currentSchool: function(key, value) {
    if (arguments.length > 1) {
      this.set('currentSchoolBuffer', value);
    }
    var self = this;
    //always return a promise even if the school has been set manaully (by the school-picker for instance)
    return new Ember.RSVP.Promise(function(resolve) {
      var buffer = self.get('currentSchoolBuffer');
      if(buffer != null){
        resolve(buffer);
      }

      resolve(self.get('primarySchool'));
    });
  }.property('currentUser'),
  canChangeSchool: function(){
    return this.get('schools.length') > 1;
  }.property('schools.@each'),
  availableCohortsObserver: function(){
    var self = this;
    this.get('availableCohorts').then(function(cohorts){
      if(!cohorts.contains(self.get('currentCohort'))){
        self.set('currentCohort', null);
      }
    });
  }.observes('availableCohorts'),
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
  preferredDashboard: 'dashboard.week'
});
