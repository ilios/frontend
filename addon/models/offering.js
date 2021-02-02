import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import momentFormat from 'ember-moment/computeds/format';
import moment from 'moment';

const { not } = computed;
const { all } = RSVP;

export default Model.extend({
  room: attr('string'),
  site: attr('string'),
  url: attr('string'),
  startDate: attr('date'),
  endDate: attr('date'),
  updatedAt: attr('date'),
  session: belongsTo('session', { async: true }),
  learnerGroups: hasMany('learner-group', { async: true }),
  instructorGroups: hasMany('instructor-group', { async: true }),
  learners: hasMany('user', {
    async: true,
    inverse: 'offerings',
  }),
  instructors: hasMany('user', {
    async: true,
    inverse: 'instructedOfferings',
  }),
  //startFoo and key properties are used in creating offering blocks
  startDayOfYear: momentFormat('startDate', 'DDDD'),
  startYear: momentFormat('startDate', 'YYYY'),
  startTime: momentFormat('startDate', 'HHmm'),
  endDayOfYear: momentFormat('endDate', 'DDDD'),
  endYear: momentFormat('endDate', 'YYYY'),
  endTime: momentFormat('endDate', 'HHmm'),
  startYearAndDayOfYear: momentFormat('startDate', 'DDDDYYYY'),
  endYearAndDayOfYear: momentFormat('endDate', 'DDDDYYYY'),
  isMultiDay: not('isSingleDay'),
  isSingleDay: computed('startYearAndDayOfYear', 'endYearAndDayOfYear', function () {
    return this.startYearAndDayOfYear === this.endYearAndDayOfYear;
  }),
  dateKey: computed('startDayOfYear', 'startYear', function () {
    return this.startYear + this.startDayOfYear;
  }),
  timeKey: computed(
    'startDayOfYear',
    'startYear',
    'startTime',
    'endDayOfYear',
    'endYear',
    'endTime',
    function () {
      const properties = [
        'startYear',
        'startDayOfYear',
        'startTime',
        'endYear',
        'endDayOfYear',
        'endTime',
      ];
      let key = '';
      for (let i = 0; i < properties.length; i++) {
        key += this.get(properties[i]);
      }
      return key;
    }
  ),
  /**
   * All instructors associated with this offering, either directly or indirectly via instructor groups.
   * @property allInstructors
   * @type {Ember.computed}
   */
  allInstructors: computed('instructors.[]', 'instructorGroups.@each.users', async function () {
    const instructorGroups = await this.instructorGroups;
    const instructors = await this.instructors;
    const instructorsInInstructorGroups = await all(instructorGroups.mapBy('users'));
    const allInstructors = instructorsInInstructorGroups.reduce((array, set) => {
      return array.pushObjects(set.toArray());
    }, []);

    allInstructors.pushObjects(instructors.toArray());

    return allInstructors.uniq().sortBy('fullName');
  }),
  /**
   * All learners associated with this offering, either directly or indirectly via learner groups.
   * @property allLearners
   * @type {Ember.computed}
   */
  allLearners: computed('learners.[]', 'learnerGroups.[]', async function () {
    const learnerGroups = await this.learnerGroups;
    const learners = await this.learners;
    const learnersInLearnerGroups = await all(learnerGroups.mapBy('users'));
    const allLearners = learnersInLearnerGroups.reduce((array, set) => {
      return array.pushObjects(set.toArray());
    }, []);

    allLearners.pushObjects(learners.toArray());

    return allLearners.uniq().sortBy('fullName');
  }),

  durationHours: computed('startDate', 'endDate', function () {
    const startDate = this.startDate;
    const endDate = this.endDate;

    if (!startDate || !endDate) {
      return 0;
    }
    const mStart = moment(startDate);
    const mEnd = moment(endDate);
    const diffInHours = mEnd.diff(mStart, 'hours');

    return diffInHours;
  }),
  durationMinutes: computed('startDate', 'endDate', function () {
    const startDate = this.startDate;
    const endDate = this.endDate;

    if (!startDate || !endDate) {
      return 0;
    }
    const mStart = moment(startDate);
    const mEnd = moment(endDate);

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
  }),
});
