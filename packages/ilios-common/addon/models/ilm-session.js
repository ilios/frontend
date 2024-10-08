import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class IlmSession extends Model {
  @attr('number')
  hours;

  @attr('date')
  dueDate;

  @belongsTo('session', { async: true, inverse: 'ilmSession' })
  session;

  @hasMany('learner-group', { async: true, inverse: 'ilmSessions' })
  learnerGroups;

  @hasMany('instructor-group', { async: true, inverse: 'ilmSessions' })
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

  /**
   * Retrieves a list of all instructors that are either directly attached to this ILM,
   * or that are attached via instructor groups.
   * @returns {Promise<Array>}
   */
  async getAllInstructors() {
    const instructors = await this.instructors;
    const instructorGroups = await this.instructorGroups;
    const instructorsInInstructorGroups = await Promise.all(mapBy(instructorGroups, 'users'));
    return uniqueValues([...instructors, ...instructorsInInstructorGroups.flat()]);
  }
}
