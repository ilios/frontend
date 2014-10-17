import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  iliosAdministratorEmail: DS.attr('string'),
  isDeleted: DS.attr('boolean'),
  programs: DS.hasMany('program', {async: true}),
  stewardedProgramYears: DS.hasMany('program-year', {async: true}),
  instructorGroups: DS.hasMany('instructor-group', {async: true})
});
