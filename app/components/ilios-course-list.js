import Component from '@ember/component';
import ObjectProxy from '@ember/object/proxy';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

const CourseProxy = ObjectProxy.extend({
  currentUser: null,
  content: null,
  intl: null,
  isSaving: false,
  permissionChecker: null,
  showRemoveConfirmation: false,

  status: computed('content.{isPublished,isScheduled}', function() {
    const intl = this.intl;
    const course = this.content;
    let translation = 'general.';
    if (course.get('isScheduled')) {
      translation += 'scheduled';
    } else if (course.get('isPublished')) {
      translation += 'published';
    } else {
      translation += 'notPublished';

    }
    return intl.t(translation);
  }),

  userCanDelete: computed('content', 'content.{archived,locked}', 'currentUser.model.directedCourses.[]', async function() {
    const permissionChecker = this.permissionChecker;
    const course = this.content;
    if (course.get('isPublishedOrScheduled')) {
      return false;
    } else if (course.hasMany('descendants').ids().length > 0) {
      return false;
    }
    return permissionChecker.canDeleteCourse(course);
  }),

  userCanLock: computed(
    'content',
    'content.{archived,locked}',
    'currentUser.model.directedCourses.[]', async function() {
      const permissionChecker = this.permissionChecker;
      const course = this.content;
      return permissionChecker.canUpdateCourse(course);
    }
  ),

  userCanUnLock: computed(
    'content',
    'content.{archived,locked}', async function() {
      const permissionChecker = this.permissionChecker;
      const course = this.content;
      return permissionChecker.canUnlockCourse(course);
    }
  )
});

export default Component.extend({
  currentUser: service(),
  intl: service(),
  permissionChecker: service(),
  tagName: "",
  courses: null,
  query: null,
  sortBy: 'title',
  lock() {},
  remove() {},
  setSortBy() {},
  unlock() {},

  proxiedCourses: computed('courses.[]', function() {
    const intl = this.intl;
    const courses = this.courses;
    if (!courses) {
      return [];
    }
    return courses.map(course => {
      return CourseProxy.create({
        content: course,
        intl,
        currentUser: this.currentUser,
        permissionChecker: this.permissionChecker
      });
    });
  }),

  sortedCourses: computed(
    'proxiedCourses.[]',
    'sortedAscending',
    'sortBy', function() {
      let sortBy = this.sortBy;
      if (-1 !== sortBy.indexOf(':')) {
        sortBy = sortBy.split(':', 1)[0];
      }
      const sortedAscending = this.sortedAscending;
      const courses = this.proxiedCourses;
      let sortedCourses = courses.sortBy(sortBy);
      if (!sortedAscending) {
        sortedCourses = sortedCourses.slice().reverse();
      }
      return sortedCourses;
    }
  ),

  sortedAscending: computed('sortBy', function() {
    return this.sortBy.search(/desc/) === -1;
  }),

  actions: {
    remove(courseProxy) {
      this.remove(courseProxy.get('content'));
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
          this.unlock(courseProxy.get('content')).then(()=>{
            courseProxy.set('isSaving', false);
          });
        }
      });
    },

    lockCourse(courseProxy){
      courseProxy.get('userCanLock').then(permission => {
        if (permission) {
          courseProxy.set('isSaving', true);
          this.lock(courseProxy.get('content')).then(()=>{
            courseProxy.set('isSaving', false);
          });
        }
      });
    },

    sortBy(what){
      const sortBy = this.sortBy;
      if(sortBy === what){
        what += ':desc';
      }
      this.setSortBy(what);
    }
  }
});
