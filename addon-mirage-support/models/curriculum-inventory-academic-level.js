import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  report: belongsTo('curriculum-inventory-report', { inverse: 'academicLevels' }),
  startingSequenceBlocks: hasMany('curriculum-inventory-sequence-block', {
    inverse: 'startingAcademicLevel',
  }),
  endingSequenceBlocks: hasMany('curriculum-inventory-sequence-block', {
    inverse: 'endingAcademicLevel',
  }),
});
