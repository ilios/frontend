import moment from 'moment';
import Ember from 'ember';
import momentFormat from 'ember-moment/computeds/format';

const { Component, computed, RSVP, Object:EmberObject } = Ember;
const { oneWay, sort } = computed;
const { Promise } = RSVP;

export default Component.extend({
  store: Ember.inject.service(),
  session: null,
  offerings: oneWay('session.offerings'),
  editable: true,

  /**
   * @property offeringBlocks
   * @type {Ember.computed}
   * @public
   */
  offeringBlocks: computed('offerings.@each.{startDate,endDate,room,instructorGroups}', function() {
    return new Promise(resolve => {
      let offerings = this.get('offerings');
      if (offerings == null) {
        resolve([]);
      }
      offerings.then(arr => {
        let dateBlocks = {};
        arr.forEach(offering => {
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
        resolve(dateBlockArray.sortBy('dateStamp'));
      });
    });
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
  //we have to init the offerins array because otherwise it gets passed by reference
  //and shared among isntances
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
  sortOfferingsBy: ['learnerGroups.firstObject.title'],
  sortedOfferings: sort('offerings', 'sortOfferingsBy'),
});
