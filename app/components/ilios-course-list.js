import Ember from 'ember';
import DS from 'ember-data';

const { computed, inject, RSVP, ObjectProxy, Component } = Ember;
const { service } = inject;
const { PromiseObject } = DS;
const { collect, sort } = computed;

const CourseProxy = ObjectProxy.extend({
  content: null,
  currentUser: null,
  showRemoveConfirmation: false,
  status: computed('content.isPublished', 'content.isScheduled', function(){
    let course = this.get('content');
    if (course.get('isScheduled')) {
      return 's';
    }
    if (course.get('isPublished')) {
      return 'p';
    }

    return 'd';
  }),
  userCanDelete: computed('content', 'currentUser.model.directedCourses.[]', function(){
    let defer = RSVP.defer();
    const course = this.get('content');
    if (course.get('isPublishedOrScheduled')) {
      defer.resolve(false);
    } else {
      this.get('currentUser.userIsDeveloper').then(isDeveloper => {
        if(isDeveloper){
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
  currentUser: service(),
  courses: [],
  proxiedCourses: computed('courses.[]', function(){
    return this.get('courses').map(course => {
      return CourseProxy.create({
        content: course,
        currentUser: this.get('currentUser')
      });
    });
  }),
  sortBy: 'title',
  sortCourseBy: collect('sortBy'),
  sortedCourses: sort('proxiedCourses', 'sortCourseBy'),
  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
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
    sortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.get('setSortBy')(what);
    },
  }
});
