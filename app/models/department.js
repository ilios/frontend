import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  school: DS.belongsTo('school', {async: true}),
  stewards: DS.hasMany('program-year-steward', {async: true}),
});
