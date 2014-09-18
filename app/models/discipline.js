import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  owningSchool: DS.belongsTo('school'),
  courses: DS.hasMany('course'),
  programYears: DS.hasMany('program-year'),
  sessions: DS.hasMany('session'),
});
