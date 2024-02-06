import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  startingAcademicLevel: belongsTo('curriculum-inventory-academic-level', {
    inverse: 'startingSequenceBlocks',
  }),
  endingAcademicLevel: belongsTo('curriculum-inventory-academic-level', {
    inverse: 'endingSequenceBlocks',
  }),
  parent: belongsTo('curriculum-inventory-sequence-block', { inverse: 'children' }),
  children: hasMany('curriculum-inventory-sequence-block', { inverse: 'parent' }),
  report: belongsTo('curriculum-inventory-report', {
    inverse: 'sequenceBlocks',
  }),
  sessions: hasMany('session', { inverse: null }),
  excludedSessions: hasMany('session', { inverse: null }),
  course: belongsTo('course', { inverse: null }),
});
