import Ember from 'ember';
import DS from 'ember-data';

const { attr, belongsTo, hasMany, Model } = DS;
const { RSVP, computed } = Ember;
const { map } = RSVP;

export default Model.extend({
  title: attr('string'),
  school: belongsTo('school', {async: true}),
  learnerGroups: hasMany('learner-group', {async: true}),
  ilmSessions: hasMany('ilm-session', {async: true}),
  users: hasMany('user', {async: true}),
  offerings: hasMany('offering', {async: true}),

  coursesFromOfferings: computed('offerings.[]', async function () {
    const offerings = await this.get('offerings');
    const courses = await map(offerings.toArray(), async offering => {
      const session = await offering.get('session');
      return session.get('course');
    });
    return courses.uniq();
  }),

  coursesFromIlmSessions: computed('ilmSessions.[]', async function () {
    const ilmSessions = await this.get('ilmSessions');
    const courses = await map(ilmSessions.toArray(), async ilmSession => {
      const session = await ilmSession.get('session');
      return session.get('course');
    });
    return courses.uniq();
  }),

  courses: computed('coursesFromOfferings.[]', 'coursesFromIlmSessions.[]', async function () {
    const offeringCourses = await this.get('coursesFromOfferings');
    const ilmCourses = await this.get('coursesFromIlmSessions');
    const courses = [];
    courses.pushObjects(offeringCourses);
    courses.pushObjects(ilmCourses);
    return courses.uniqBy('id');
  })
});
