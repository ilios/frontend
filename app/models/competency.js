import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  owningSchool: DS.belongsTo('school'),
  parent: DS.belongsTo('competency', {async: true, inverse: 'children'}),
  children: DS.hasMany('competency', {async: true, inverse: 'parent'}),
  objectives: DS.hasMany('objective',  {async: true}),
  aamcPcrses: DS.hasMany('aamc-pcrs',  {async: true}),
  programYears: DS.hasMany('program-year',  {async: true}),
});
