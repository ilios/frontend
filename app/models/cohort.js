import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class CohortModel extends Model {
  @attr('string')
  title;

  @belongsTo('program-year', { async: true, inverse: 'cohort' })
  programYear;

  @hasMany('course', { async: true, inverse: 'cohorts' })
  courses;

  @hasMany('learner-group', { async: true, inverse: 'cohort' })
  learnerGroups;

  @hasMany('user', { async: true, inverse: 'cohorts' })
  users;
}
