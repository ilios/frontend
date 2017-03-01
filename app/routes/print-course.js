import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route, inject, RSVP } = Ember;
const { service } = inject;
const { Promise, all } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  titleToken: 'general.coursesAndSessions',
  beforeModel(){
    this.controllerFor('application').set('showHeader', false);
    this.controllerFor('application').set('showNavigation', false);
  },
  // only allow priviligeds users to view unpublished courses
  afterModel(course, transition){
    if (course.get('isPublishedOrScheduled')) {
      return this.preloadCourseData(course);
    }
    return new Promise(resolve => {
      const currentUser = this.get('currentUser');
      all([
        currentUser.get('userIsCourseDirector'),
        currentUser.get('userIsFaculty'),
        currentUser.get('userIsDeveloper'),
      ]).then(hasRole => {
        if (!hasRole.includes(true)) {
          transition.abort();
        } else {
          this.preloadCourseData(course).then(()=> {
            resolve(true);
          });
        }
      });
    });
  },
  preloadCourseData(course){
    return new Promise(resolve => {
      all([
        course.get('sessions'),
        course.get('competencies'),
        course.get('objectives'),
      ]).then(()=> {
        resolve(true);
      });
    });
  },
  renderTemplate() {
    this.render({ outlet: 'fullscreen' });
  }
});
