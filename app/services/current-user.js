import Ember from 'ember';
import DS from 'ember-data';
import config from 'ilios/config/environment';
import ajax from 'ic-ajax';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  model: function(){
    var deferred = Ember.RSVP.defer();
    var self = this;
    var url = '/' + config.adapterNamespace + '/currentsession';
    ajax(url).then(function(data) {
      self.get('store').find('user', data.currentsession.userId).then(function(user){
        deferred.resolve(user);
      });
    });
    return DS.PromiseObject.create({
      promise: deferred.promise
    });
  }.property(),
  currentSchoolBuffer: null,
  currentSchool: Ember.computed('model.primarySchool', {
    set: function(key, value){
      this.set('currentSchoolBuffer', value);
    },
    get: function() {
      //always return a promise even if the school has been set manaully (by the school-picker for instance)
      return new Ember.RSVP.Promise((resolve) => {
        var buffer = this.get('currentSchoolBuffer');
        if(buffer != null){
          resolve(buffer);
        }

        resolve(this.get('model.primarySchool'));
      });
    }
  }),
  canChangeSchool: function(){
    return this.get('currentUsr.schools.length') > 1;
  }.property('currentUsr.schools.@each'),
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
  events: function(from, to){
    var deferred = Ember.RSVP.defer();
    this.get('model').then(user => {
      var url = '/' + config.adapterNamespace + '/userevents/' +
      user.get('id') + '?from=' + from + '&to=' + to;
      ajax(url).then(data => {
        let events = data.userevent;
        deferred.resolve(events.sortBy('startDate'));
      });
    });

    return deferred.promise;
  },

});
