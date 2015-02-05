import DS from 'ember-data';

export default DS.Model.extend({
  owningSchool: DS.belongsTo('school', {async: true}),
  aamcMethods: DS.hasMany('aamc-method', {async: true}),
  sessions: DS.hasMany('session', {async: true}),
});
