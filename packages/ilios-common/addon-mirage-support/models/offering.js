import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  session: belongsTo('session', { inverse: 'offerings' }),
  learnerGroups: hasMany('learner-group', { inverse: 'offerings' }),
  instructorGroups: hasMany('instructor-group', { inverse: 'offerings' }),
  learners: hasMany('user', { inverse: 'offerings' }),
  instructors: hasMany('user', { inverse: 'instructedOfferings' }),
});
