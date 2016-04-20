import Ember from 'ember';
import DS from 'ember-data';

const { computed, inject, RSVP, ObjectProxy, Component } = Ember;
const { service } = inject;
const { PromiseObject } = DS;

const CourseProxy = ObjectProxy.extend({
  isUserCourse: false,
  content: null,
  currentUser: null,
  showRemoveConfirmation: false,

  userCanDelete: computed('isUserCourse', 'content', 'currentUser.model.directedCourses.[]', function(){
    let defer = RSVP.defer();

    if (this.get('isUserCourse')) {
      defer.resolve(false);
    } else {
      const course = this.get('content');
      this.get('currentUser.userIsDeveloper').then(isDeveloper => {
        if (isDeveloper) {
          defer.resolve(true);
        } else {
          this.get('currentUser.model').then(user => {
            user.get('directedCourses').then(directedCourses => {
              defer.resolve(directedCourses.contains(course));
            });
          });
        }
      });
    }

    return PromiseObject.create({
      promise: defer.promise
    });
  })
});

export default Component.extend({
  userCoursesOnly: false,
  currentUser: service(),
  courses: [],
  proxiedCourses: computed('courses.[]', function(){
    return this.get('courses').map(course => {
      return CourseProxy.create({
        content: course,
        currentUser: this.get('currentUser'),
        isUserCourse: this.get('userCoursesOnly'),
      });
    });
  }),
  actions: {
    edit: function(courseProxy){
      this.sendAction('edit', courseProxy.get('content'));
    },
    remove: function(courseProxy){
      this.sendAction('remove', courseProxy.get('content'));
    },
    cancelRemove: function(courseProxy){
      courseProxy.set('showRemoveConfirmation', false);
    },
    confirmRemove: function(courseProxy){
      courseProxy.set('showRemoveConfirmation', true);
    },
  }
});
