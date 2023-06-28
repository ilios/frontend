import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  program: belongsTo('program', { inverse: 'programYears' }),
  cohort: belongsTo('cohort', { inverse: 'programYear' }),
  directors: hasMany('user', { inverse: 'programYears' }),
  competencies: hasMany('competency', { inverse: 'programYears' }),
  programYearObjectives: hasMany('program-year-objective', { inverse: 'programYear' }),
  terms: hasMany('term', { inverse: 'programYears' }),
});
