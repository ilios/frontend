import DS from 'ember-data';

const { attr, belongsTo, hasMany, Model } = DS;

export default Model.extend({
  session: belongsTo('session', { async: true }),
  hours: attr('number'),
  dueDate: attr('date'),
  learnerGroups: hasMany('learner-group', { async: true }),
  instructorGroups: hasMany('instructor-group', { async: true }),
  instructors: hasMany('user', {
    async: true,
    inverse: 'instructorIlmSessions'
  }),
  learners: hasMany('user', {
    async: true,
    inverse: 'learnerIlmSessions'
  }),
});
