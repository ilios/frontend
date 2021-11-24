import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { use } from 'ember-could-get-used-to-this';
import ResolveFlatMapBy from 'ilios-common/classes/resolve-flat-map-by';

export default class InstructorGroupModel extends Model {
  @attr('string')
  title;

  @belongsTo('school', { async: true })
  school;

  @hasMany('learner-group', { async: true })
  learnerGroups;

  @hasMany('ilm-session', { async: true })
  ilmSessions;

  @hasMany('user', { async: true })
  users;

  @hasMany('offering', { async: true })
  offerings;

  @use _offeringSessions = new ResolveFlatMapBy(() => [this.offerings, 'session']);
  @use coursesFromOfferings = new ResolveFlatMapBy(() => [this._offeringSessions, 'course']);
  @use _ilmSessionSessions = new ResolveFlatMapBy(() => [this.ilmSessions, 'session']);
  @use coursesFromIlmSessions = new ResolveFlatMapBy(() => [this._ilmSessionSessions, 'course']);

  get courses() {
    if (!this.coursesFromIlmSessions || !this.coursesFromOfferings) {
      return [];
    }
    return [...this.coursesFromIlmSessions, ...this.coursesFromOfferings].uniq();
  }

  /**
   * A list of all sessions associated with this group, via offerings or via ILMs.
   */
  get sessions() {
    if (!this._offeringSessions || !this._ilmSessionSessions) {
      return [];
    }
    return [...this._offeringSessions, ...this._ilmSessionSessions].uniq();
  }

  /**
   * Returns the number of users in this group
   */
  get usersCount() {
    return this.users.length;
  }
}
