import Ember from 'ember';

const { Component, computed, inject } = Ember;
const { service }= inject;

export default Component.extend({
  currentUser: service(),
  tagName: 'div',
  classNames: ['dashboard-block', 'dashboard-my-courses'],
  listOfCourses: computed('currentUser.activeRelatedCoursesInThisYearAndLastYear.[]', function(){
    return this.get('currentUser').get('activeRelatedCoursesInThisYearAndLastYear').then(courses => {
      return courses.sortBy('startDate');
    });
  }),
});
