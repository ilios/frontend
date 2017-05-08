import Ember from 'ember';
import DS from 'ember-data';

const { computed, RSVP } = Ember;
const { PromiseArray } = DS;
const { Promise } = RSVP;

export default DS.Model.extend({
  session: DS.belongsTo('session', {async: true}),
  hours: DS.attr('number'),
  dueDate: DS.attr('date'),
  learnerGroups: DS.hasMany('learner-group', {async: true}),
  instructorGroups: DS.hasMany('instructor-group', {async: true}),
  instructors: DS.hasMany('user', {
    async: true,
    inverse: 'instructorIlmSessions'
  }),
  learners: DS.hasMany('user', {
    async: true,
    inverse: 'learnerIlmSessions'
  }),
  allInstructors: computed('instructors.[]', 'instructorGroups.@each.users', function(){
    let promise = new Promise(resolve => {
      this.get('instructorGroups').then(instructorGroups => {
        let promises = instructorGroups.getEach('users');
        promises.pushObject(this.get('instructors'));
        RSVP.all(promises).then(trees => {
          let instructors = trees.reduce((array, set) => {
            return array.pushObjects(set.toArray());
          }, []);
          instructors = instructors.uniq().sortBy('lastName', 'firstName');
          resolve(instructors);
        });
      });
    });
    return PromiseArray.create({
      promise: promise
    });
  }),
});
