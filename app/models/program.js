import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  shortTitle: DS.attr('string'),
  duration: DS.attr('number'),
  deleted: DS.attr('boolean'),
  publishedAsTbd: DS.attr('boolean'),
  owningSchool: DS.belongsTo('school', {async: true}),
  programYears: DS.hasMany('program-years', {async: true}),
  publishEvent: DS.belongsTo('publish-event', {async: true}),
  curriculumInventoryReports: DS.hasMany('curriculum-inventory-report', {async: true})
});
