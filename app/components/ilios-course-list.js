import Ember from 'ember';

const { computed, RSVP, ObjectProxy, Component } = Ember;
const { Promise }= RSVP;

const CourseProxy = ObjectProxy.extend({
  content: null,
  currentUser: null,
  showRemoveConfirmation: false,
  i18n: null,
  isSaving: false,
  status: computed('content.isPublished', 'content.isScheduled', function(){
    const i18n = this.get('i18n');
    let course = this.get('content');
    let translation = 'general.';
    if (course.get('isScheduled')) {
      translation += 'scheduled';
    } else if (course.get('isPublished')) {
      translation += 'published';
    } else {
      translation += 'notPublished';

    }

    return i18n.t(translation).string;
  }),
  userCanDelete: computed('content', 'currentUser.userIsDeveloper', 'currentUser.model.directedCourses.[]', function(){
    return new Promise(resolve => {
      const course = this.get('content');
      const currentUser = this.get('currentUser');
      if (course.get('isPublishedOrScheduled')) {
        resolve(false);
      } else {
        currentUser.get('userIsDeveloper').then(isDeveloper => {
          if (isDeveloper) {
            resolve(true);
          } else {
            currentUser.get('model').then(user => {
              user.get('directedCourses').then(directedCourses => {
                resolve(directedCourses.includes(course));
              });
            });
          }
        });
      }
    });
  }),
  userCanLock: computed('content', 'currentUser.userIsDeveloper', 'currentUser.model.directedCourses.[]', function(){
    return new Promise(resolve => {
      const course = this.get('content');
      const currentUser = this.get('currentUser');
      currentUser.get('userIsDeveloper').then(isDeveloper => {
        if (isDeveloper) {
          resolve(true);
        } else {
          currentUser.get('model').then(user => {
            user.get('directedCourses').then(directedCourses => {
              resolve(directedCourses.includes(course));
            });
          });
        }
      });
    });
  }),
  userCanUnLock: computed('content', 'currentUser.userIsDeveloper', function(){
    return new Promise(resolve => {
      const currentUser = this.get('currentUser');
      currentUser.get('userIsDeveloper').then(isDeveloper => {
        resolve(isDeveloper);
      });
    });
  }),
});
export default Component.extend({
  currentUser: Ember.inject.service(),
  i18n: Ember.inject.service(),
  courses: [],
  proxiedCourses: computed('courses.[]', function(){
    const i18n = this.get('i18n');
    const courses = this.get('courses');
    if (!courses) {
      return [];
    }
    return courses.map(course => {
      return CourseProxy.create({
        content: course,
        i18n,
        currentUser: this.get('currentUser')
      });
    });
  }),
  sortBy: 'title',
  sortedCourses: computed('proxiedCourses.[]', 'sortBy', 'sortedAscending', function(){
    let sortBy = this.get('sortBy');
    if (-1 !== sortBy.indexOf(':')) {
      sortBy = sortBy.split(':', 1)[0];
    }
    let sortedAscending = this.get('sortedAscending');
    const courses = this.get('proxiedCourses');
    let sortedCourses = courses.sortBy(sortBy);
    if (!sortedAscending) {
      sortedCourses = sortedCourses.slice().reverse();
    }

    return sortedCourses;
  }),

  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),
  actions: {
    remove(courseProxy) {
      this.sendAction('remove', courseProxy.get('content'));
    },
    cancelRemove(courseProxy) {
      courseProxy.set('showRemoveConfirmation', false);
    },
    confirmRemove(courseProxy) {
      courseProxy.set('showRemoveConfirmation', true);
    },
    unlockCourse(courseProxy){
      courseProxy.get('userCanUnLock').then(permission => {
        if (permission) {
          courseProxy.set('isSaving', true);
          this.get('unlock')(courseProxy.get('content')).then(()=>{
            courseProxy.set('isSaving', false);
          });
        }
      });
    },
    lockCourse(courseProxy){
      courseProxy.get('userCanLock').then(permission => {
        if (permission) {
          courseProxy.set('isSaving', true);
          this.get('lock')(courseProxy.get('content')).then(()=>{
            courseProxy.set('isSaving', false);
          });
        }
      });
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
