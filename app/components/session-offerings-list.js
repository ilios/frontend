import moment from 'moment';
import Ember from 'ember';
import DS from 'ember-data';
import momentFormat from 'ember-moment/computeds/format';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  session: null,
  offerings: Ember.computed.oneWay('session.offerings'),
  editable: true,
  offeringBlocks: function(){
    var offerings = this.get('offerings');
    if(offerings == null){
      return Ember.A();
    }
    var deferred = Ember.RSVP.defer();
    offerings.then(function(offerings){
      let dateBlocks = {};
      offerings.forEach(function(offering){
        let key = offering.get('dateKey');
        if(!(key in dateBlocks)){
          dateBlocks[key] = OfferingDateBlock.create({
            dateKey: key
          });
        }
        dateBlocks[key].addOffering(offering);

      });
      //convert indexed object to array
      let dateBlockArray = [];
      for(let key in dateBlocks){
        dateBlockArray.pushObject(dateBlocks[key]);
      }
      deferred.resolve(dateBlockArray.sortBy('dateStamp'));
    });
    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }.property('offerings.@each.{startDate,endDate,room,instructorGroups.@each}'),
  actions: {
    removeOffering: function(offering){
      let session = this.get('session');
      session.get('offerings').then(offerings => {
        offerings.removeObject(offering);
        session.save();
        offering.deleteRecord();
        offering.save();
      });
    },
  }
});

var OfferingBlock = Ember.Object.extend({
  //we have to init the offerins array because otherwise it gets passed by reference
  //and shared among isntances
  init: function(){
    this._super();
    this.set('offerings', []);
  },
  offerings: null,
  addOffering: function(offering){
    this.get('offerings').pushObject(offering);
  },
});

var OfferingDateBlock = OfferingBlock.extend({
  dateKey: null,
  //convert our day of the year key into a date at midnight
  date: function(){
    var year = this.get('dateKey').substring(0,4);
    var dayOfYear = this.get('dateKey').substring(4);
    var date = new Date(year, 0);
    return new Date(date.setDate(dayOfYear));
  }.property('dateKey'),
  dateStamp: momentFormat('date', 'X'),
  dayOfWeek: momentFormat('date', 'dddd'),
  dayOfMonth: momentFormat('date', 'MMMM Do'),
  offeringTimeBlocks: function(){
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
  }.property('offerings.@each.{startDate,endDate}')
});

var OfferingTimeBlock = OfferingBlock.extend({
  timeKey: null,
  isMultiDay: function(){
    return this.get('startDate').format('DDDDYYYY') !== this.get('endDate').format('DDDDYYYY');
  }.property('startDate', 'endDate'),
  //pull our times out of the key
  startDate: function(){
    let key = this.get('timeKey').substring(0,11);
    return moment(key, 'YYYYDDDHHmm');
  }.property('timeKey'),
  endDate: function(){
    let key = this.get('timeKey').substring(11);
    return moment(key, 'YYYYDDDHHmm');
  }.property('timeKey'),
  startTime: momentFormat('startDate', 'LT'),
  endTime: momentFormat('endDate', 'LT'),
  longStartText: momentFormat('startDate', 'dddd MMMM Do [@] LT'),
  longEndText: momentFormat('endDate', 'dddd MMMM Do [@] LT'),
  sortOfferingsBy: ['learnerGroups.firstObject.title'],
  sortedOfferings: Ember.computed.sort('offerings', 'sortOfferingsBy'),
});
