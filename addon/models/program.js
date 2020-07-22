import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { all } from 'rsvp';

export default Model.extend({
  title: attr('string'),
  shortTitle: attr('string'),
  duration: attr('number', { defaultValue: 1 }),
  school: belongsTo('school', {async: true}),
  programYears: hasMany('program-year', { async: true, inverse: 'program' }),
  directors: hasMany('user', { async: true, inverse: 'directedPrograms' }),
  curriculumInventoryReports: hasMany('curriculum-inventory-report', {async: true}),

  hasCurriculumInventoryReports: computed('curriculumInventoryReports.[]', function(){
    return (this.hasMany('curriculumInventoryReports').ids().length > 0);
  }),

  hasProgramYears: computed('programYears.[]', function(){
    return (this.hasMany('programYears').ids().length > 0);
  }),

  /**
   * All cohorts associated with this program via its program years.
   * @property cohorts
   * @type {Ember.computed}
   * @public
   */
  cohorts: computed('programYears.[]', async function() {
    const programYears = await this.get('programYears');
    return all(programYears.toArray().mapBy('cohort'));
  }),

  /**
   * All courses linked to this program via its program years/cohorts.
   * @property courses
   * @type {Ember.computed}
   * @public
   */
  courses: computed('cohorts.[]', async function() {
    const cohorts = await this.get('cohorts');
    const courses = await all(cohorts.mapBy('courses'));
    return courses.reduce((array, set) => {
      array.pushObjects(set.toArray());
      return array;
    }, []).uniq();
  }),
});
