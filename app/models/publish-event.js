import DS from 'ember-data';

export default DS.Model.extend({
  administrator: DS.belongsTo('user', {async: true}),
  sessions: DS.hasMany('session', {async: true}),
  courses: DS.hasMany('course', {async: true})
});
