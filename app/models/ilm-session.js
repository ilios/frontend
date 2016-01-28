import Ember from 'ember';
import DS from 'ember-data';

const { computed, RSVP } = Ember;
const { PromiseArray } = DS;

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
  allInstructors: computed('instructors.[]', 'instructorsGroups.@each.users.[]', function(){
    var defer = RSVP.defer();
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
