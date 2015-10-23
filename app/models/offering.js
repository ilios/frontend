import DS from 'ember-data';
import Ember from 'ember';
import momentFormat from 'ember-moment/computeds/format';

export default DS.Model.extend({
  room: DS.attr('string'),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  deleted: DS.attr('boolean'),
  updatedAt: DS.attr('date'),
  session: DS.belongsTo('session', {async: true}),
  learnerGroups: DS.hasMany('learner-group', {async: true}),
  publishEvent: DS.belongsTo('publish-event', {async: true}),
  instructorGroups: DS.hasMany('instructor-group', {async: true}),
  learners: DS.hasMany('user', {
      async: true,
      inverse: 'offerings'
  }),
  instructors: DS.hasMany('user', {
      async: true,
      inverse: 'instructedOfferings'
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
