import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  cohort: belongsTo('cohort', { inverse: 'learnerGroups' }),
  parent: belongsTo('learner-group', { inverse: 'children' }),
  children: hasMany('learner-group', { inverse: 'parent' }),
  ilmSessions: hasMany('ilm-session', { inverse: 'learnerGroups' }),
  offerings: hasMany('offering', { inverse: 'learnerGroups' }),
  instructorGroups: hasMany('instructor-group', { inverse: 'learnerGroups' }),
  users: hasMany('user', { inverse: 'learnerGroups' }),
  instructors: hasMany('user', { inverse: 'instructedLearnerGroups' }),
  ancestor: belongsTo('learner-group', { inverse: 'descendants' }),
  descendants: hasMany('learner-group', { inverse: 'ancestor' }),
});
