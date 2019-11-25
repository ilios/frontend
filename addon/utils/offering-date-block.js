import EmberObject, { computed } from "@ember/object";
import moment from 'moment';
import format from 'ember-moment/computeds/format';

const { sort } = computed;

const OfferingBlock = EmberObject.extend({
  init() {
    this._super(...arguments);
    this.set('offerings', []);
  },
  offerings: null,
  addOffering(offering){
    this.get('offerings').pushObject(offering);
  },
});

const OfferingDateBlock = OfferingBlock.extend({
  dateKey: null,
  //convert our day of the year key into a date at midnight
  date: computed('dateKey', function(){
    const year = this.get('dateKey').substring(0,4);
    const dayOfYear = this.get('dateKey').substring(4);
    const date = new Date(year, 0);
    return new Date(date.setDate(dayOfYear));
  }),
  dateStamp: format('date', 'X'),
  dayOfWeek: format('date', 'dddd'),
  dayOfMonth: format('date', 'MMMM Do'),
  offeringTimeBlocks: computed('offerings.@each.{startDate,endDate}', function(){
    const offeringGroups = {};
    this.get('offerings').forEach(function(offering){
      const key = offering.get('timeKey');
      if(!(key in offeringGroups)){
        offeringGroups[key] = OfferingTimeBlock.create({
          timeKey: key
        });
      }
      offeringGroups[key].addOffering(offering);
    });
    //convert indexed object to array
    const offeringGroupArray = [];
    let key;
    for(key in offeringGroups){
      offeringGroupArray.pushObject(offeringGroups[key]);
    }

    return offeringGroupArray.sortBy('timeKey');
  })
});

const OfferingTimeBlock = OfferingBlock.extend({
  init() {
    this._super(...arguments);
    this.set('sortOfferingsBy', ['learnerGroups.firstObject.title']);
  },
  timeKey: null,
  isMultiDay: computed('startDate', 'endDate', function(){
    return this.get('startDate').format('DDDDYYYY') !== this.get('endDate').format('DDDDYYYY');
  }),
  //pull our times out of the key
  startDate: computed('timeKey', function(){
    const key = this.get('timeKey').substring(0,11);
    return moment(key, 'YYYYDDDHHmm');
  }),
  endDate: computed('timeKey', function(){
    const key = this.get('timeKey').substring(11);
    return moment(key, 'YYYYDDDHHmm');
  }),
  startTime: format('startDate', 'LT'),
  endTime: format('endDate', 'LT'),
  longStartText: format('startDate', 'dddd MMMM Do [@] LT'),
  longEndText: format('endDate', 'dddd MMMM Do [@] LT'),
  sortOfferingsBy: null,
  sortedOfferings: sort('offerings', 'sortOfferingsBy'),
  durationHours: computed('totalMinutes', function () {
    return Math.floor(this.totalMinutes/60);
  }),
  durationMinutes: computed('totalMinutes', function () {
    return this.totalMinutes % 60;
  }),
  totalMinutes: computed('startDate', 'endDate', function () {
    const startDate = this.get('startDate');
    const endDate = this.get('endDate');
    const diff = endDate.diff(startDate);
    const duration = moment.duration(diff).as('minutes');
    return duration;
  }),
});

export default OfferingDateBlock;
