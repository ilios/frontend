import moment from 'moment';
import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  i18n: Ember.inject.service(),
  title: DS.attr('string'),
  programYear: DS.belongsTo('program-year', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  learnerGroups: DS.hasMany('learner-group', {async: true}),
  users: DS.hasMany('user', {async: true}),
  displayTitle: '',
  competencies: function(){
    var self = this;
    return new Ember.RSVP.Promise(function(resolve) {
      self.get('programYear').then(function(programYear){
        if(programYear){
          programYear.get('competencies').then(function(competencies){
            resolve(competencies);
          });
        }
      });
    });
  }.property('programYear.competencies.@each'),
  objectives: function(){
    var self = this;
    return new Ember.RSVP.Promise(function(resolve) {
      self.get('programYear').then(function(programYear){
        if(programYear){
          programYear.get('objectives').then(function(objectives){
            resolve(objectives);
          });
        }
      });
    });
  }.property('programYear.objectives.@each'),
  topLevelLearnerGroups: function(){
    let defer = Ember.RSVP.defer();
    this.get('learnerGroups').then(groups => {
      let topLevelGroups = Ember.A();
      let promises = [];
      
      groups.forEach(group => {
        promises.pushObject(group.get('topLevelGroup').then(topLevelGroup => {
          topLevelGroups.pushObject(topLevelGroup);
        }));
      });
      Ember.RSVP.all(promises).then(() => {
        defer.resolve(topLevelGroups.uniq());
      });
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }.property('learnerGroups.@each'),
  displayTitleObserver: function(){
    var self = this;
    if(this.get('title.length') > 0){
      this.set('displayTitle', this.get('title'));
    } else {
      this.get('programYear').then(function(programYear){
        //I dont' know why this is necessary, but sometimes tests fail if we assume that programYear is set here
        var classOfYear = programYear?programYear.get('classOfYear'):null;
        var title = self.get('i18n').t('general.classOf', {year: classOfYear});
        self.set('displayTitle', title);
      });
    }
  }.observes('title', 'programYear.classOfYear'),
  currentLevel: function(){
    var startYear = this.get('programYear.startYear');
    if(startYear){
      return Math.abs(moment().year(startYear).diff(moment(), 'years'));
    }
    return '';
  }.property('programYear.startYear')
});
