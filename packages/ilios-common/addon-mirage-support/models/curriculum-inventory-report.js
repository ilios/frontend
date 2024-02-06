import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  export: belongsTo('curriculum-inventory-export', { inverse: 'report' }),
  sequence: belongsTo('curriculum-inventory-sequence', { inverse: 'report' }),
  sequenceBlocks: hasMany('curriculum-inventory-sequence-block', {
    inverse: 'report',
  }),
  program: belongsTo('program', { inverse: 'curriculumInventoryReports' }),
  academicLevels: hasMany('curriculum-inventory-academic-level', {
    inverse: 'report',
  }),
  administrators: hasMany('user', { inverse: 'administeredCurriculumInventoryReports' }),
});
