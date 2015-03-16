/*
  This is an example factory definition. Factories are
  used inside acceptance tests.

  Create more files in this directory to define additional factories.
*/
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  firstName: (i) => `${i} guy`,
  lastName: (i) => `Mc${i}son`,
  middelName: 'm,',
  enabled: true,
  primarySchool: 1,
});
//
//
// firstName: DS.attr('string'),
// lastName: DS.attr('string'),
// middleName: DS.attr('string'),
// phone: DS.attr('string'),
// email:  DS.attr('string'),
// enabled:  DS.attr('boolean'),
// ucUid:  DS.attr('string'),
// otherId:  DS.attr('string'),
// offerings: DS.hasMany('offering', {async: true}),
// learningMaterials: DS.hasMany('learning-material', {async: true}),
// publishEvents: DS.hasMany('publish-event', {async: true}),
// reports: DS.hasMany('report', {async: true}),
// directedCourses: DS.hasMany('course', {async: true}),
// learnerGroups: DS.hasMany('learner-group', {
