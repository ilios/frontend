import DS from 'ember-data';
import Ember from 'ember';

const { computed, isEmpty, RSVP } = Ember;
const { Promise, all } = RSVP;

export default DS.Model.extend({
  name: DS.attr('string'),
  description: DS.attr('string'),
  year: DS.attr('string'),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  absoluteFileUri: DS.attr('string'),
  export: DS.belongsTo('curriculum-inventory-export', {async: true}),
  sequence: DS.belongsTo('curriculum-inventory-sequence', {async: true}),
  sequenceBlocks: DS.hasMany('curriculum-inventory-sequence-block', {async: true}),
  program: DS.belongsTo('program', {async: true}),
  academicLevels: DS.hasMany('curriculum-inventory-academic-level', {async: true}),

  /**
   * A list of top-level sequence blocks owned by this report.
   * Returns a promise that resolves to an array of sequence block objects.
   * @property topLevelSequenceBlocks
   * @type {Ember.computed}
   * @public
   */
  topLevelSequenceBlocks: computed('sequenceBlocks.[]', function () {
    return new Promise(resolve => {
      this.get('sequenceBlocks').then(sequenceBlocks => {
        let topLevelBlocks = sequenceBlocks.filter(function (block) {
          return !block.belongsTo('parent').id();
        });
        resolve(topLevelBlocks);
      });
    });
  }),

  /**
   * Whether this report has been finalized, or not. Returns a boolean.
   * @property isFinalized
   * @type {Ember.computed}
   * @public
   */
  isFinalized: computed('export', function () {
    return !!this.belongsTo('export').id();
  }),

  /**
   * A label corresponding to this report's academic year. Returns a string.
   * @property yearLabel
   * @type {Ember.computed}
   * @public
   */
  yearLabel: computed('year', function () {
    const year = this.get('year');
    return year + ' - ' + (parseInt(year, 10) + 1);
  }),

  /**
   * A list of courses that area linked to sequence blocks in this report.
   * Returns a promise that resolves to an array of course objects.
   * @property linkedCourses
   * @type {Ember.computed}
   * @public
   */
  linkedCourses: computed('sequenceBlocks.@each.course', function () {
    return new Promise(resolve => {
      this.get('sequenceBlocks').then(sequenceBlocks => {
        let promises = [];

        sequenceBlocks.forEach(block => {
          promises.pushObject(block.get('course'));
        });

        all(promises).then(courses => {
          courses = courses.filter(function (course) {
            return !isEmpty(course);
          });
          resolve(courses);
        });
      });
    });
  }),

  /**
   * Whether this report has any courses linked to it via its sequence blocks, or not. Returns a boolean.
   * @property hasLinkedCourses
   * @type {Ember.computed}
   * @public
   */
  hasLinkedCourses: computed('linkedCourses.[]', function () {
    return new Promise(resolve => {
      this.get('linkedCourses').then(linkedCourses => {
        let hasCourses = !Ember.isEmpty(linkedCourses);
        resolve(hasCourses);
      });
    });
  })
});

