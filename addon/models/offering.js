import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { use } from 'ember-could-get-used-to-this';
import moment from 'moment';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import ResolveFlatMapBy from 'ilios-common/classes/resolve-flat-map-by';
import { mapBy, sortBy, uniqueById } from '../utils/array-helpers';

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

  @belongsTo('session', { async: true })
  session;

  @hasMany('learner-group', { async: true })
  learnerGroups;

  @hasMany('instructor-group', { async: true })
  instructorGroups;

  @hasMany('user', { async: true, inverse: 'offerings' })
  learners;

  @hasMany('user', { async: true, inverse: 'instructedOfferings' })
  instructors;

  @use _instructors = new ResolveAsyncValue(() => [this.instructors]);
  @use _instructorsInGroups = new ResolveFlatMapBy(() => [this.instructorGroups, 'users']);
  @use _learners = new ResolveAsyncValue(() => [this.learners]);
  @use _learnersInGroups = new ResolveFlatMapBy(() => [this.learnerGroups, 'users']);

  get startDayOfYear() {
    return moment(this.startDate).format('DDDD');
  }

  get startYear() {
    return moment(this.startDate).format('YYYY');
  }

  get startTime() {
    return moment(this.startDate).format('HHmm');
  }

  get endDayOfYear() {
    return moment(this.endDate).format('DDDD');
  }

  get endYear() {
    return moment(this.endDate).format('YYYY');
  }

  get endTime() {
    return moment(this.endDate).format('HHmm');
  }

  get startYearAndDayOfYear() {
    return moment(this.startDate).format('DDDDYYYY');
  }

  get endYearAndDayOfYear() {
    return moment(this.endDate).format('DDDDYYYY');
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

  get allInstructors() {
    if (!this._instructors || !this._instructorsInGroups) {
      return [];
    }
    return sortBy(
      uniqueById([...this._instructors.slice(), ...this._instructorsInGroups]),
      'fullName'
    );
  }

  get allLearners() {
    if (!this._learners || !this._learnersInGroups) {
      return [];
    }
    return sortBy(uniqueById([...this._learners.slice(), ...this._learnersInGroups]), 'fullName');
  }

  get durationHours() {
    if (!this.startDate || !this.endDate) {
      return 0;
    }
    const mStart = moment(this.startDate);
    const mEnd = moment(this.endDate);
    return mEnd.diff(mStart, 'hours');
  }

  get durationMinutes() {
    if (!this.startDate || !this.endDate) {
      return 0;
    }
    const mStart = moment(this.startDate);
    const mEnd = moment(this.endDate);

    const endHour = mEnd.hour();
    const endMinute = mEnd.minute();

    mStart.hour(endHour);
    const startMinute = mStart.minute();

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
    const instructors = (await this.instructors).slice();
    const instructorGroups = (await this.instructorGroups).slice();
    const instructorsInInstructorGroups = await Promise.all(mapBy(instructorGroups, 'users'));
    return uniqueById([
      ...instructors,
      ...instructorsInInstructorGroups.map((instructorGroup) => instructorGroup.slice()).flat(),
    ]);
  }
}
