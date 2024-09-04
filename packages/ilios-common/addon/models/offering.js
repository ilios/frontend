import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { DateTime } from 'luxon';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { mapBy, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class Offering extends Model {
  @attr('string')
  room;

  @attr('string')
  site;

  @attr('string')
  url;

  @attr('date')
  startDate;

  @attr('date')
  endDate;

  @attr('date')
  updatedAt;

  @belongsTo('session', { async: true, inverse: 'offerings' })
  session;

  @hasMany('learner-group', { async: true, inverse: 'offerings' })
  learnerGroups;

  @cached
  get _learnerGroupsData() {
    return new TrackedAsyncData(this.learnerGroups);
  }

  @hasMany('instructor-group', { async: true, inverse: 'offerings' })
  instructorGroups;

  @cached
  get _instructorGroupsData() {
    return new TrackedAsyncData(this.instructorGroups);
  }

  @hasMany('user', { async: true, inverse: 'offerings' })
  learners;

  @cached
  get _learnersData() {
    return new TrackedAsyncData(this.learners);
  }

  @hasMany('user', { async: true, inverse: 'instructedOfferings' })
  instructors;

  @cached
  get _instructorsData() {
    return new TrackedAsyncData(this.instructors);
  }

  get startDayOfYear() {
    return DateTime.fromJSDate(this.startDate).toFormat('ooo');
  }

  get startYear() {
    return DateTime.fromJSDate(this.startDate).toFormat('yyyy');
  }

  get startTime() {
    return DateTime.fromJSDate(this.startDate).toFormat('HHmm');
  }

  get endDayOfYear() {
    return DateTime.fromJSDate(this.endDate).toFormat('ooo');
  }

  get endYear() {
    return DateTime.fromJSDate(this.endDate).toFormat('yyyy');
  }

  get endTime() {
    return DateTime.fromJSDate(this.endDate).toFormat('HHmm');
  }

  get startYearAndDayOfYear() {
    return DateTime.fromJSDate(this.startDate).toFormat('oooyyyy');
  }

  get endYearAndDayOfYear() {
    return DateTime.fromJSDate(this.endDate).toFormat('oooyyyy');
  }

  get isMultiDay() {
    return !this.isSingleDay;
  }

  get isSingleDay() {
    return this.startYearAndDayOfYear === this.endYearAndDayOfYear;
  }

  get dateKey() {
    return this.startYear + this.startDayOfYear;
  }

  get timeKey() {
    const properties = [
      this.startYear,
      this.startDayOfYear,
      this.startTime,
      this.endYear,
      this.endDayOfYear,
      this.endTime,
    ];
    let key = '';
    for (let i = 0; i < properties.length; i++) {
      key += properties[i];
    }
    return key;
  }

  @cached
  get _instructorsInGroups() {
    if (!this._instructorGroupsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(Promise.all(this._instructorGroupsData.value.map((g) => g.users)));
  }

  get allInstructors() {
    if (
      !this._instructorsData.isResolved ||
      !this._instructorsInGroups ||
      !this._instructorsInGroups.isResolved
    ) {
      return [];
    }
    return sortBy(
      uniqueValues([...this._instructorsData.value, ...this._instructorsInGroups.value.flat()]),
      'fullName',
    );
  }

  @cached
  get _learnersInGroups() {
    if (!this._learnerGroupsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(Promise.all(this._learnerGroupsData.value.map((g) => g.users)));
  }

  get allLearners() {
    if (
      !this._learnersData.isResolved ||
      !this._learnersInGroups ||
      !this._learnersInGroups.isResolved
    ) {
      return [];
    }
    return sortBy(
      uniqueValues([...this._learnersData.value, ...this._learnersInGroups.value.flat()]),
      'fullName',
    );
  }

  get durationHours() {
    if (!this.startDate || !this.endDate) {
      return 0;
    }
    return DateTime.fromJSDate(this.endDate).diff(DateTime.fromJSDate(this.startDate), [
      'hours',
      'minutes',
    ]).hours;
  }

  get durationMinutes() {
    if (!this.startDate || !this.endDate) {
      return 0;
    }
    const mEnd = DateTime.fromJSDate(this.endDate);

    const endHour = mEnd.hour;
    const endMinute = mEnd.minute;

    const mStart = DateTime.fromJSDate(this.startDate).set({ hour: endHour });
    const startMinute = mStart.minute;

    let diff = 0;
    if (endMinute > startMinute) {
      diff = endMinute - startMinute;
    } else if (endMinute < startMinute) {
      diff = 60 - startMinute + endMinute;
    }
    return diff;
  }

  /**
   * Retrieves a list of all instructors that are either directly attached to this offering,
   * or that are attached via instructor groups.
   * @returns {Promise<Array>}
   */
  async getAllInstructors() {
    const instructors = await this.instructors;
    const instructorGroups = await this.instructorGroups;
    const instructorsInInstructorGroups = await Promise.all(mapBy(instructorGroups, 'users'));
    return uniqueValues([
      ...instructors,
      ...instructorsInInstructorGroups.map((instructorGroup) => instructorGroup).flat(),
    ]);
  }
}
