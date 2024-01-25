import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  school: belongsTo('school', { inverse: 'programs' }),
  programYears: hasMany('program-year', { inverse: 'program' }),
  directors: hasMany('user', { inverse: 'directedPrograms' }),
  curriculumInventoryReports: hasMany('curriculum-inventory-report', { inverse: 'program' }),
});
