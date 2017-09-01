import moment from 'moment';
import Ember from 'ember';
import DS from 'ember-data';

const { computed, RSVP } = Ember;
const { alias } = computed;
const { Model } = DS;
const { Promise } = RSVP;

export default Model.extend({
  title: DS.attr('string'),
  programYear: DS.belongsTo('program-year', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  learnerGroups: DS.hasMany('learner-group', {async: true}),
  users: DS.hasMany('user', {async: true}),
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
  /**
   * @deprecated Use rootLevelLearnerGroups instead [ST 2017/08/31]
   */
  topLevelLearnerGroups: computed('learnerGroups.[]', function(){
    Ember.deprecate('Use rootLevelLearnerGroups instead.');
    let defer = Ember.RSVP.defer();
    this.get('learnerGroups').then(learnerGroups => {
      let topLevelGroups = learnerGroups.filter(learnerGroup => learnerGroup.belongsTo('parent').value() === null);
      defer.resolve(topLevelGroups);
    });

    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),

  /**
   * All top-level learner groups associated with this cohort.
   *
   * @property rootLevelLearnerGroups
   * @type {Ember.computed}
   * @public
   */
  rootLevelLearnerGroups: computed('learnerGroups.[]', async function() {
    let learnerGroups = await this.get('learnerGroups');
    return learnerGroups.filter(learnerGroup => learnerGroup.belongsTo('parent').value() === null);
  }),

  currentLevel: computed('programYear.startYear', function(){
    var startYear = this.get('programYear.startYear');
    if(startYear){
      return Math.abs(moment().year(startYear).diff(moment(), 'years'));
    }
    return '';
  }),
  program: computed('programYear.program', function(){
    return new Promise(resolve => {
      this.get('programYear').then(programYear => {
        programYear.get('program').then(program => {
          resolve(program);
        });
      });
    });
  }),
  school: computed('program.school', function(){
    return new Promise(resolve => {
      this.get('program').then(program => {
        program.get('school').then(school => {
          resolve(school);
        });
      });
    });
  }),
  sortedObjectives: alias('programYear.sortedObjectives'),
  classOfYear: computed('programYear.startYear', 'programYear.program.duration', async function(){
    const programYear = await this.get('programYear');
    const startYear = parseInt(programYear.get('startYear'));
    const program = await programYear.get('program');
    const duration = parseInt(program.get('duration'));
    return (startYear + duration);
  }),
});
