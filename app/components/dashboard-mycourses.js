import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, inject, RSVP } = Ember;
const { service }= inject;

export default Component.extend({
  store: service(),
  currentUser: service(),
  tagName: 'div',
  classNames: ['dashboard-block'],
  courseSorting: ['startDate:desc'],
  sortedListOfCourses: computed.sort('listOfCourses', 'courseSorting'),
  listOfCourses: computed('currentUser.model', function(){
    let defer = RSVP.defer();
    this.get('currentUser').get('model').then( user => {
      this.get('store').query('course', {
        filters: {
          users: [user.get('id')],
          locked: false,
          archived: false
        }
      }).then(filteredCourses => {
        defer.resolve(filteredCourses);
      });
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
});
