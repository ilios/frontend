import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { uniqueValues } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class InstructorGroupModel extends Model {
  @attr('string')
  title;

  @belongsTo('school', { async: true, inverse: 'instructorGroups' })
  school;

  @hasMany('learner-group', { async: true, inverse: 'instructorGroups' })
  learnerGroups;

  @hasMany('ilm-session', { async: true, inverse: 'instructorGroups' })
  ilmSessions;

  @cached
  get _ilmSessionsData() {
    return new TrackedAsyncData(this.ilmSessions);
  }

  @hasMany('user', { async: true, inverse: 'instructorGroups' })
  users;

  @hasMany('offering', { async: true, inverse: 'instructorGroups' })
  offerings;

  @cached
  get _offeringsData() {
    return new TrackedAsyncData(this.offerings);
  }

  @cached
  get _offeringSessionsData() {
    if (this._offeringsData.isResolved) {
      return new TrackedAsyncData(Promise.all(this._offeringsData.value.map((o) => o.session)));
    }

    return null;
  }

  @cached
  get _coursesFromOfferings() {
    if (this._offeringSessionsData?.isResolved) {
      return new TrackedAsyncData(
        Promise.all(this._offeringSessionsData.value.map((s) => s.course))
      );
    }

    return null;
  }

  @cached
  get _ilmSessionSessionsData() {
    if (this._ilmSessionsData.isResolved) {
      return new TrackedAsyncData(
        Promise.all(this._ilmSessionsData.value.map((ilm) => ilm.session))
      );
    }

    return null;
  }

  @cached
  get _coursesFromilmSessions() {
    if (this._ilmSessionSessionsData?.isResolved) {
      return new TrackedAsyncData(
        Promise.all(this._ilmSessionSessionsData.value.map((s) => s.course))
      );
    }

    return null;
  }

  get courses() {
    if (!this._coursesFromOfferings?.isResolved || !this._coursesFromilmSessions?.isResolved) {
      return [];
    }
    return uniqueValues([
      ...this._coursesFromilmSessions.value,
      ...this._coursesFromOfferings.value,
    ]);
  }

  /**
   * A list of all sessions associated with this group, via offerings or via ILMs.
   */
  get sessions() {
    if (!this._ilmSessionSessionsData?.isResolved || !this._offeringSessionsData?.isResolved) {
      return [];
    }
    return uniqueValues([
      ...this._offeringSessionsData.value,
      ...this._ilmSessionSessionsData.value,
    ]);
  }

  /**
   * Returns the number of users in this group
   */
  get usersCount() {
    return this.hasMany('users').ids().length;
  }
}
