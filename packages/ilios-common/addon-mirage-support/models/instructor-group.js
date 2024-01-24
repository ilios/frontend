import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  school: belongsTo('school', { inverse: 'instructorGroups' }),
  learnerGroups: hasMany('learner-group', { inverse: 'instructorGroups' }),
  ilmSessions: hasMany('ilm-session', { inverse: 'instructorGroups' }),
  users: hasMany('user', { inverse: 'instructorGroups' }),
  offerings: hasMany('offering', { inverse: 'instructorGroups' }),
});
