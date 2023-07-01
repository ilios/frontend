import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  programYear: belongsTo('program-year', { inverse: 'cohort' }),
  courses: hasMany('course', { inverse: 'cohorts' }),
  learnerGroups: hasMany('learner-group', { inverse: 'cohort' }),
  users: hasMany('user', { inverse: 'cohorts' }),
});
