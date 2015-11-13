import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  sessionTypeCssClass: DS.attr('string'),
  assessment: DS.attr('boolean'),
  assessmentOption: DS.belongsTo('assessment-option', {async: true}),
  school: DS.belongsTo('school', {async: true}),
  aamcMethods: DS.hasMany('aamc-method', {async: true}),
});
