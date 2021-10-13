import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class IlmSession extends Model {
  @attr('number')
  hours;

  @attr('date')
  dueDate;

  @belongsTo('session', { async: true })
  session;

  @hasMany('learner-group', { async: true })
  learnerGroups;

  @hasMany('instructor-group', { async: true })
  instructorGroups;

  @hasMany('user', {
    async: true,
    inverse: 'instructorIlmSessions',
  })
  instructors;

  @hasMany('user', {
    async: true,
    inverse: 'learnerIlmSessions',
  })
  learners;
}
