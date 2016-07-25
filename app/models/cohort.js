import moment from 'moment';
import Ember from 'ember';
import DS from 'ember-data';

const { computed, observer, RSVP } = Ember;
const { Model, PromiseArray } = DS;
const { Promise } = RSVP;

export default Model.extend({
  i18n: Ember.inject.service(),
  title: DS.attr('string'),
  programYear: DS.belongsTo('program-year', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  learnerGroups: DS.hasMany('learner-group', {async: true}),
  users: DS.hasMany('user', {async: true}),
  displayTitle: '',
  competencies: computed('programYear.competencies.[]', function(){
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
  }),
  objectives: computed('programYear.objectives.[]', function(){
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
  }),
  topLevelLearnerGroups: computed('learnerGroups.[]', function(){
    let defer = Ember.RSVP.defer();
    this.get('learnerGroups').then(learnerGroups => {
      let topLevelGroups = learnerGroups.filter(learnerGroup => learnerGroup.belongsTo('parent').value() === null)
      defer.resolve(topLevelGroups);
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  displayTitleObserver: observer('title', 'programYear.classOfYear', function(){
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
  }),
  currentLevel: computed('programYear.startYear', function(){
    var startYear = this.get('programYear.startYear');
    if(startYear){
      return Math.abs(moment().year(startYear).diff(moment(), 'years'));
    }
    return '';
  }),
  school: computed('programYear.program.school', function(){
    return new Promise(resolve => {
      this.get('programYear').then(programYear => {
        programYear.get('program').then(program => {
          program.get('school').then(school => {
            resolve(school);
          });
        });
      });
    });
  }),
});
