import DS from 'ember-data';
import Ember from 'ember';
import momentFormat from 'ember-moment/computeds/format';

const { computed, RSVP } = Ember;
const { PromiseArray } = DS;
const { not } = computed;

export default DS.Model.extend({
  room: DS.attr('string'),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
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
  isSingleDay: computed('startYearAndDayOfYear', 'endYearAndDayOfYear', function(){
    return this.get('startYearAndDayOfYear') === this.get('endYearAndDayOfYear');
  }),
  isMultiDay: not('isSingleDay'),
  dateKey: computed('startDayOfYear', 'startYear', function(){
    return this.get('startYear') + this.get('startDayOfYear');
  }),
  timeKey: computed(
    'startDayOfYear',
    'startYear',
    'startTime',
    'endDayOfYear',
    'endYear',
    'endTime',
    function(){
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
    }
  ),
  allInstructors: computed('instructors.[]', 'instructorsGroups.@each.users.[]', function(){
    var defer = Ember.RSVP.defer();
    this.get('instructorGroups').then(instructorGroups => {
      var promises = instructorGroups.getEach('users');
      promises.pushObject(this.get('instructors'));
      RSVP.all(promises).then(trees => {
        var instructors = trees.reduce((array, set) => {
            return array.pushObjects(set.toArray());
        }, []);
        instructors = instructors.uniq().sortBy('lastName', 'firstName');
        defer.resolve(instructors);
      });
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
});
