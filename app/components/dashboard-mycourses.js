import Ember from 'ember';

const { Component, computed, inject } = Ember;
const { service }= inject;

export default Component.extend({
  currentUser: service(),
  tagName: 'div',
  classNames: ['dashboard-block'],
  courseSorting: ['startDate:desc'],
  sortedListOfCourses: computed.sort('listOfCourses', 'courseSorting'),
  listOfCourses: computed('currentUser.relatedCourses.[]', function(){
    return this.get('currentUser').get('activeRelatedCoursesInThisYearAndLastYear');
  }),
});
