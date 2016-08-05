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

  topLevelSequenceBlocks: computed('sequenceBlocks.[]', function(){
    return new Promise(resolve => {
      this.get('sequenceBlocks').then(sequenceBlocks => {
        let topLevelBlocks = sequenceBlocks.filter(function (block) {
          return !block.belongsTo('parent').id();
        });
        resolve(topLevelBlocks);
      });
    });
  }),

  isFinalized: computed('export', function(){
    return !! this.belongsTo('export').id();
  }),

  yearLabel: computed('year', function() {
    const year = this.get('year');
    return year + ' - ' + (parseInt(year, 10) + 1);
  }),

  linkedCourses: computed('sequenceBlocks.@each.course', function() {
    return new Promise(resolve => {
      this.get('sequenceBlocks').then(sequenceBlocks => {
        let promises = [];

        sequenceBlocks.forEach(block => {
          promises.pushObject(block.get('course'));
        });

        all(promises).then(courses => {
          courses = courses.filter(function(course) {
            return ! isEmpty(course);
          });
          resolve(courses);
        });
      });
    })
  }),

  hasLinkedCourses: computed('linkedCourses.[]', function(){
    return new Promise(resolve => {
      this.get('linkedCourses').then(linkedCourses => {
        let hasCourses = ! Ember.isEmpty(linkedCourses);
        resolve(hasCourses);
      })
    });
  }),

  linkableCourses: computed('year', 'linkedCourses.[]', function(){
    return new Promise(resolve => {
      this.get('program').then(program => {
        let schoolId = program.belongsTo('school').id();
        this.get('store').query('course', {
          filters: {
            school: [schoolId],
            published: true,
            year: this.get('year'),
          },
          limit: 10000
        }).then(allLinkableCourses => {
          this.get('linkedCourses').then(linkedCourses => {
            let linkableCourses = allLinkableCourses.filter(function(course) {
              return ! linkedCourses.contains(course);
            });
            resolve(linkableCourses);
          })
        });
      });
    });
  })
});
