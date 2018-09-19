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
    this.offerings.pushObject(offering);
  },
});

const OfferingDateBlock = OfferingBlock.extend({
  dateKey: null,
  //convert our day of the year key into a date at midnight
  date: computed('dateKey', function(){
    let year = this.dateKey.substring(0,4);
    let dayOfYear = this.dateKey.substring(4);
    let date = new Date(year, 0);
    return new Date(date.setDate(dayOfYear));
  }),
  dateStamp: format('date', 'X'),
  dayOfWeek: format('date', 'dddd'),
  dayOfMonth: format('date', 'MMMM Do'),
  offeringTimeBlocks: computed('offerings.@each.{startDate,endDate}', function(){
    let offeringGroups = {};
    this.offerings.forEach(function(offering){
      let key = offering.get('timeKey');
      if(!(key in offeringGroups)){
        offeringGroups[key] = OfferingTimeBlock.create({
          timeKey: key
        });
      }
      offeringGroups[key].addOffering(offering);
    });
    //convert indexed object to array
    let offeringGroupArray = [];
    for(let key in offeringGroups){
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
    return this.startDate.format('DDDDYYYY') !== this.endDate.format('DDDDYYYY');
  }),
  //pull our times out of the key
  startDate: computed('timeKey', function(){
    let key = this.timeKey.substring(0,11);
    return moment(key, 'YYYYDDDHHmm');
  }),
  endDate: computed('timeKey', function(){
    let key = this.timeKey.substring(11);
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
    const startDate = this.startDate;
    const endDate = this.endDate;
    const diff = endDate.diff(startDate);
    const duration = moment.duration(diff).as('minutes');
    return duration;
  }),
});

export default OfferingDateBlock;
