import DS from 'ember-data';
import Ember from 'ember';
import { moment } from 'ember-moment/computed';

var Offering = DS.Model.extend({
    startDate: DS.attr('date'),
    endDate: DS.attr('date'),
    deleted: DS.attr('boolean'),
    room: DS.attr('string'),
    lastUpdatedOn: DS.attr('date'),
    session: DS.belongsTo('session', {async: true}),
    users: DS.hasMany('user', {
        async: true,
        inverse: 'offerings'
    }),
    learnerGroups: DS.hasMany('learner-group', {async: true}),
    instructorGroups: DS.hasMany('instructor-group', {async: true}),
    instructors: DS.hasMany('user', {
        async: true,
        inverse: 'instructedOfferings'
    }),
    publishEvent: DS.belongsTo('publish-event', {async: true}),
    recurringEvents: DS.hasMany('recurring-event', {async: true}),
    //startFoo and key properties are used in creating offering blocks
    startDayOfYear: moment('startDate', 'DDDD'),
    startYear: moment('startDate', 'YYYY'),
    startTime: moment('startDate', 'HHmm'),
    endDayOfYear: moment('endDate', 'DDDD'),
    endYear: moment('endDate', 'YYYY'),
    endTime: moment('endDate', 'HHmm'),
    startYearAndDayOfYear: moment('startDate', 'DDDDYYYY'),
    endYearAndDayOfYear: moment('endDate', 'DDDDYYYY'),
    isSingleDay: function(){
      return this.get('startYearAndDayOfYear') === this.get('endYearAndDayOfYear');
    }.property('startYearAndDayOfYear', 'endYearAndDayOfYear'),
    isMultiDay: Ember.computed.not('isSingleDay'),
    dateKey: function(){
      return this.get('startYear') + this.get('startDayOfYear');
    }.property('startDayOfYear', 'startYear'),
    timeKey: function(){
      let properties = [
        'startYear',
        'startDayOfYear',
        'startTime',
        'endYear',
        'endDayOfYear',
        'endTime'
      ];
      let key = '';
      for(let i = 0; i < properties.length; i++){
        key += this.get(properties[i]);
      }

      return key;
    }.property('startDayOfYear', 'startYear', 'startTime', 'endDayOfYear', 'endYear', 'endTime'),
    allInstructors: function(){
      var self = this;
      var defer = Ember.RSVP.defer();
      this.get('instructorGroups').then(function(instructorGroups){
        var promises = instructorGroups.getEach('users');
        promises.pushObject(self.get('instructors'));
        Ember.RSVP.all(promises).then(function(trees){
          var instructors = trees.reduce(function(array, set){
              return array.pushObjects(set.toArray());
          }, []);
          instructors = instructors.uniq().sortBy('lastName', 'firstName');
          defer.resolve(instructors);
        });
      });
      return DS.PromiseArray.create({
        promise: defer.promise
      });
    }.property('instructors.@each', 'instructorsGroups.@each.users.@each')
});

export default Offering;
