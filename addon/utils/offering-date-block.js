import EmberObject, { computed } from '@ember/object';
import { sort } from '@ember/object/computed';
import moment from 'moment';
import { sortBy } from './array-helpers';

const OfferingBlock = EmberObject.extend({
  offerings: null,
  init() {
    this._super(...arguments);
    this.offerings = [];
  },
  addOffering(offering) {
    this.offerings = [...this.offerings, offering];
  },
});

const OfferingDateBlock = OfferingBlock.extend({
  dateKey: null,
  //convert our day of the year key into a date at midnight
  date: computed('dateKey', function () {
    const year = this.dateKey.substring(0, 4);
    const dayOfYear = this.dateKey.substring(4);
    const date = new Date(year, 0);
    return new Date(date.setDate(dayOfYear));
  }),
  dateStamp: computed('date', function () {
    return moment(this.date).format('X');
  }),
  dayOfWeek: computed('date', function () {
    return moment(this.date).format('dddd');
  }),
  dayOfMonth: computed('date', function () {
    return moment(this.date).format('MMMM Do');
  }),
  offeringTimeBlocks: computed('offerings.@each.{startDate,endDate}', function () {
    const offeringGroups = {};
    this.offerings.forEach(function (offering) {
      const key = offering.get('timeKey');
      if (!(key in offeringGroups)) {
        offeringGroups[key] = OfferingTimeBlock.create({
          timeKey: key,
        });
      }
      offeringGroups[key].addOffering(offering);
    });
    //convert indexed object to array
    const offeringGroupArray = [];
    let key;
    for (key in offeringGroups) {
      offeringGroupArray.push(offeringGroups[key]);
    }

    return sortBy(offeringGroupArray, 'timeKey');
  }),
});

const OfferingTimeBlock = OfferingBlock.extend({
  init() {
    this._super(...arguments);
    this.set('sortOfferingsBy', ['learnerGroups.firstObject.title']);
  },
  timeKey: null,
  isMultiDay: computed('startDate', 'endDate', function () {
    return this.startDate.format('DDDDYYYY') !== this.endDate.format('DDDDYYYY');
  }),
  //pull our times out of the key
  startDate: computed('timeKey', function () {
    const key = this.timeKey.substring(0, 11);
    return moment(key, 'YYYYDDDHHmm');
  }),
  endDate: computed('timeKey', function () {
    const key = this.timeKey.substring(11);
    return moment(key, 'YYYYDDDHHmm');
  }),
  startTime: computed('startDate', function () {
    return moment(this.startDate).format('LT');
  }),
  endTime: computed('endDate', function () {
    return moment(this.endDate).format('LT');
  }),
  longStartText: computed('startDate', function () {
    return moment(this.startDate).format('dddd MMMM Do [@] LT');
  }),
  longEndText: computed('endDate', function () {
    return moment(this.endDate).format('dddd MMMM Do [@] LT');
  }),
  sortOfferingsBy: null,
  sortedOfferings: sort('offerings', 'sortOfferingsBy'),
  durationHours: computed('totalMinutes', function () {
    return Math.floor(this.totalMinutes / 60);
  }),
  durationMinutes: computed('totalMinutes', function () {
    return this.totalMinutes % 60;
  }),
  totalMinutes: computed('startDate', 'endDate', function () {
    const startDate = this.startDate;
    const endDate = this.endDate;
    const diff = endDate.diff(startDate);
    const duration = moment.duration(diff).as('minutes');
    return duration;
  }),
});

export default OfferingDateBlock;
