import Ember from 'ember';
import DS from 'ember-data';

const { RSVP, computed } = Ember;
const { Promise, map } = RSVP;

export default DS.Model.extend({
  title: DS.attr('string'),
  school: DS.belongsTo('school', {async: true}),
  learnerGroups: DS.hasMany('learner-group', {async: true}),
  ilmSessions: DS.hasMany('ilm-session', {async: true}),
  users: DS.hasMany('user', {async: true}),
  offerings: DS.hasMany('offering', {async: true}),
  coursesFromOfferings: computed('offerings.[]', function(){
    return new Promise(resolve => {
      this.get('offerings').then(offerings => {
        map(offerings.toArray(), offering => {
          return new Promise(resolve => {
            offering.get('session').then(session => {
              session.get('course').then(course => {
                resolve(course);
              });
            });
          });
        }).then(courses => {
          resolve(courses.uniq());
        });
      });
    });
  }),
  coursesFromIlmSessions: computed('ilmSessions.[]', function(){
    return new Promise(resolve => {
      this.get('ilmSessions').then(ilmSessions => {
        map(ilmSessions.toArray(), ilmSession => {
          return new Promise(resolve => {
            ilmSession.get('session').then(session => {
              session.get('course').then(course => {
                resolve(course);
              });
            });
          });
        }).then(courses => {
          resolve(courses.uniq());
        });
      });
    });
  }),
  courses: computed('coursesFromOfferings.[]', 'coursesFromIlmSessions.[]', function(){
    return new Promise(resolve => {
      this.get('coursesFromOfferings').then(offeringCourses => {
        this.get('coursesFromIlmSessions').then(ilmCourses => {
          let courses = [];
          courses.pushObjects(offeringCourses);
          courses.pushObjects(ilmCourses);
          resolve(courses.uniqBy('id'));
        });
      });
    });
  }),
});
