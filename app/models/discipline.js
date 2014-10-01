import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  owningSchool: DS.belongsTo('school',  {async: true}),
  courses: DS.hasMany('course',  {async: true}),
  programYears: DS.hasMany('program-year',  {async: true}),
  sessions: DS.hasMany('session',  {async: true}),
});
