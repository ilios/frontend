import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  vocabulary: belongsTo('vocabulary', { inverse: 'terms' }),
  parent: belongsTo('term', { inverse: 'children' }),
  children: hasMany('term', { inverse: 'parent' }),
  programYears: hasMany('program-year', { inverse: 'terms' }),
  sessions: hasMany('session', { inverse: 'terms' }),
  courses: hasMany('course', { inverse: 'terms' }),
  aamcResourceTypes: hasMany('aamc-resource-type', { inverse: 'terms' }),
  courseObjectives: hasMany('course-objective', { inverse: 'terms' }),
  programYearObjectives: hasMany('program-year-objective', { inverse: 'terms' }),
  sessionObjectives: hasMany('session-objective', { inverse: 'terms' }),
});
