import moment from 'moment';
import Ember from 'ember';
import DS from 'ember-data';

const { computed } = Ember;
const { alias } = computed;
const { Model } = DS;

export default Model.extend({
  title: DS.attr('string'),
  programYear: DS.belongsTo('program-year', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  learnerGroups: DS.hasMany('learner-group', {async: true}),
  users: DS.hasMany('user', {async: true}),

  competencies: alias('programYear.competencies'),
  objectives: alias('programYear.objectives'),

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
  program: alias('programYear.program'),
  school: alias('program.school'),
  sortedObjectives: alias('programYear.sortedObjectives'),
  classOfYear: computed('programYear.startYear', 'programYear.program.duration', async function(){
    const programYear = await this.get('programYear');
    const startYear = parseInt(programYear.get('startYear'));
    const program = await programYear.get('program');
    const duration = parseInt(program.get('duration'));
    return (startYear + duration);
  }),
});
