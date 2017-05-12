import Ember from 'ember';

const { Component, computed, inject, RSVP } = Ember;
const { service }= inject;
const { all } = RSVP;

export default Component.extend({
  currentUser: service(),
  tagName: 'div',
  classNames: ['dashboard-block', 'dashboard-my-courses'],
  listOfCourses: computed('currentUser.activeRelatedCoursesInThisYearAndLastYear.[]', function(){
    return this.get('currentUser').get('activeRelatedCoursesInThisYearAndLastYear').then(courses => {
      return courses.sortBy('startDate');
    });
  }),
  canEditCourses: computed(
    'currentUser.userIsCourseDirector',
    'currentUser.userIsFaculty',
    'currentUser.userIsDeveloper',
    async function(){
      const currentUser = this.get('currentUser');
      const roles = await all([
        currentUser.get('userIsCourseDirector'),
        currentUser.get('userIsFaculty'),
        currentUser.get('userIsDeveloper')
      ]);

      return roles.includes(true);
    }),
});
