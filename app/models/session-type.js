import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  owningSchool: DS.belongsTo('school', {async: true}),
  aamcMethods: DS.hasMany('aamc-method', {async: true}),
  sessions: DS.hasMany('session', {async: true}),
});
