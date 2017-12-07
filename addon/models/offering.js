import DS from 'ember-data';
import Ember from 'ember';
import momentFormat from 'ember-moment/computeds/format';

const { computed, RSVP } = Ember;
const { not } = computed;
const { all } = RSVP;

export default DS.Model.extend({
  room: DS.attr('string'),
  site: DS.attr('string'),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  updatedAt: DS.attr('date'),
  session: DS.belongsTo('session', {async: true}),
  learnerGroups: DS.hasMany('learner-group', {async: true}),
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
  /**
   * All instructors associated with this offering, either directly or indirectly via instructor groups.
   * @property allInstructors
   * @type {Ember.computed}
   */
  allInstructors: computed('instructors.[]', 'instructorGroups.[]', async function(){
    const instructorGroups = await this.get('instructorGroups');
    const instructors = await this.get('instructors');
    const instructorsInInstructorGroups = await all(instructorGroups.mapBy('users'));
    const allInstructors = instructorsInInstructorGroups.reduce((array, set) => {
      return array.pushObjects(set.toArray());
    }, []);

    allInstructors.pushObjects(instructors.toArray());

    return allInstructors.uniq().sortBy('lastName', 'firstName');
  }),
});
