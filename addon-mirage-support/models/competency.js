import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  school: belongsTo('school', { inverse: 'competencies' }),
  parent: belongsTo('competency', { inverse: 'children' }),
  children: hasMany('competency', { inverse: 'parent' }),
  aamcPcrses: hasMany('aamc-pcrs', { inverse: 'competencies' }),
  programYears: hasMany('program-year', { inverse: 'competencies' }),
  programYearObjectives: hasMany('program-year-objective', { inverse: 'competency' }),
});
