/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
import momentFormat from 'ember-moment/computeds/format';

const { oneWay, sort } = computed;

export default Component.extend({
  store: service(),
  classNames: ['session-offerings-list'],
  session: null,
  offerings: oneWay('session.offerings'),
  editable: true,

  /**
   * @property offeringBlocks
   * @type {Ember.computed}
   * @public
   */
  offeringBlocks: computed('offerings.@each.{startDate,endDate,room,learnerGroups,instructorGroups}', async function() {
    let offerings = await this.get('offerings');
    if (isEmpty(offerings)) {
      return [];
    }
    let dateBlocks = {};
    offerings.forEach(offering => {
      let key = offering.get('dateKey');
      if (!(key in dateBlocks)) {
        dateBlocks[key] = OfferingDateBlock.create({
          dateKey: key
        });
      }
      dateBlocks[key].addOffering(offering);
    });
    //convert indexed object to array
    let dateBlockArray = [];
    for (let key in dateBlocks) {
      dateBlockArray.pushObject(dateBlocks[key]);
    }
    return dateBlockArray.sortBy('dateStamp');
  }),

  actions: {
    removeOffering(offering) {
      let session = this.get('session');
      session.get('offerings').then(offerings => {
        offerings.removeObject(offering);
        offering.deleteRecord();
        offering.save();
      });
    },
  }
});

let OfferingBlock = EmberObject.extend({
  init() {
    this._super(...arguments);
    this.set('offerings', []);
  },
  offerings: null,
  addOffering(offering){
    this.get('offerings').pushObject(offering);
  },
});

let OfferingDateBlock = OfferingBlock.extend({
  dateKey: null,
  //convert our day of the year key into a date at midnight
  date: computed('dateKey', function(){
    let year = this.get('dateKey').substring(0,4);
    let dayOfYear = this.get('dateKey').substring(4);
    let date = new Date(year, 0);
    return new Date(date.setDate(dayOfYear));
  }),
  dateStamp: momentFormat('date', 'X'),
  dayOfWeek: momentFormat('date', 'dddd'),
  dayOfMonth: momentFormat('date', 'MMMM Do'),
  offeringTimeBlocks: computed('offerings.@each.{startDate,endDate}', function(){
    let offeringGroups = {};
    this.get('offerings').forEach(function(offering){
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

let OfferingTimeBlock = OfferingBlock.extend({
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
    let key = this.get('timeKey').substring(0,11);
    return moment(key, 'YYYYDDDHHmm');
  }),
  endDate: computed('timeKey', function(){
    let key = this.get('timeKey').substring(11);
    return moment(key, 'YYYYDDDHHmm');
  }),
  startTime: momentFormat('startDate', 'LT'),
  endTime: momentFormat('endDate', 'LT'),
  longStartText: momentFormat('startDate', 'dddd MMMM Do [@] LT'),
  longEndText: momentFormat('endDate', 'dddd MMMM Do [@] LT'),
  sortOfferingsBy: null,
  sortedOfferings: sort('offerings', 'sortOfferingsBy'),
});
