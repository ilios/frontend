/* global moment */
import Ember from 'ember';
import DS from 'ember-data';
import { moment as momentHelper } from 'ember-moment/computed';
import layout from '../templates/components/session-offerings';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  layout: layout,
  classNames: ['session-offerings'],
  session: null,
  placeholderValueTranslation: 'sessions.titleFilterPlaceholder',
  offerings: Ember.computed.oneWay('session.offerings'),
  offeringBlocks: function(){
    var deferred = Ember.RSVP.defer();
    this.get('offerings').then(function(offerings){
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
  }.property('offerings.@each.{startDate,endDate,room,instructorGroups.@each}')
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
  dateStamp: momentHelper('date', 'X'),
  dayOfWeek: momentHelper('date', 'dddd'),
  dayOfMonth: momentHelper('date', 'MMMM Do'),
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

    return offeringGroupArray.sortBy('startTime');
  }.property('offerings.@each.{startDate,endDate}')
});

var OfferingTimeBlock = OfferingBlock.extend({
  timeKey: null,
  isMultiDay: function(){
    return this.get('endDate').diff(this.get('startDate'), 'days') > 0;
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
  startTime: momentHelper('startDate', 'LT'),
  endTime: momentHelper('endDate', 'LT'),
  longStartText: momentHelper('startDate', 'dddd MMMM Do [@] LT'),
  longEndText: momentHelper('endDate', 'dddd MMMM Do [@] LT'),
  sortOfferingsBy: ['learnerGroups.firstObject.title'],
  sortedOfferings: Ember.computed.sort('offerings', 'sortOfferingsBy'),
});
