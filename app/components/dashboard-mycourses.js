import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, inject } = Ember;
const { service }= inject;

export default Component.extend({
  currentUser: service(),
  tagName: 'div',
  classNames: ['dashboard-block'],
  courseSorting: ['startDate:desc'],
  sortedListOfCourses: computed.sort('listOfCourses', 'courseSorting'),
  listOfCourses: computed('currentUser.relatedCourses.[]', function(){
    let promise = new Ember.RSVP.Promise(resolve => {
      this.get('currentUser').get('relatedCourses').then(courses => {
        let filteredCourses = courses.filter(course=>!course.get('locked') && !course.get('archived'));
        resolve(filteredCourses);
      });
    });
    return DS.PromiseArray.create({
      promise: promise
    });
  }),
});
