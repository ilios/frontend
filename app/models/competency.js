import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  owningSchool: DS.belongsTo('school'),
  parent: DS.belongsTo('competency'),
  programYears: DS.hasMany('program-year'),
});
