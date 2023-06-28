import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  competency: belongsTo('competency', { inverse: 'programYearObjectives' }),
  programYear: belongsTo('program-year', { inverse: 'programYearObjectives' }),
  terms: hasMany('mesh-descriptor', { inverse: 'programYearObjectives' }),
  ancestor: belongsTo('program-year-objective', { inverse: 'descendants' }),
  descendants: hasMany('program-year-objective', { inverse: 'ancestor' }),
  courseObjectives: hasMany('course-objective', { inverse: 'programYearObjectives' }),
});
