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

  /**
   * Retrieves a list of all instructors that are either directly attached to this ILM,
   * or that are attached via instructor groups.
   * @returns {Promise<Array>}
   */
  async getAllInstructors() {
    const instructors = (await this.instructors).toArray();
    const instructorGroups = (await this.instructorGroups).toArray();
    const instructorsInInstructorGroups = await Promise.all(instructorGroups.mapBy('users'));
    return [
      ...instructors,
      ...instructorsInInstructorGroups.map((instructorGroup) => instructorGroup.toArray()).flat(),
    ].uniq();
  }
}
