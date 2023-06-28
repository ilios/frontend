import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  session: belongsTo('session', { inverse: 'ilmSession' }),
  learnerGroups: hasMany('learner-group', { inverse: 'ilmSessions' }),
  instructorGroups: hasMany('instructor-group', { inverse: 'ilmSessions' }),
  instructors: hasMany('user', { inverse: 'instructorIlmSessions' }),
  learners: hasMany('user', { inverse: 'learnerIlmSessions' }),
});
