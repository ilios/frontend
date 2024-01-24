import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  course: belongsTo('course', { inverse: 'courseObjectives' }),
  terms: hasMany('term', { inverse: 'courseObjectives' }),
  meshDescriptors: hasMany('mesh-descriptor', { inverse: 'courseObjectives' }),
  ancestor: belongsTo('course-objective', { inverse: 'descendants' }),
  descendants: hasMany('course-objective', { inverse: 'ancestor' }),
  sessionObjectives: hasMany('session-objective', { inverse: 'courseObjectives' }),
  programYearObjectives: hasMany('program-year-objective', { inverse: 'courseObjectives' }),
});
