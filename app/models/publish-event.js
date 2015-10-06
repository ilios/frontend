import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  machineIp: DS.attr('string'),
  timeStamp: DS.attr('string'),
  tableName: DS.attr('string'),
  tableRowId: DS.attr('string'),
  administrator: DS.belongsTo('user', {async: true}),
  sessions: DS.hasMany('session', {async: true}),
  programs: DS.hasMany('program', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  programYears: DS.hasMany('program-year', {async: true}),
  relatedCounts: Ember.computed.collect(
    'sessions.length',
    'courses.length',
    'programs.length',
    'programYears.length'
  ),
  totalRelated: Ember.computed.sum('relatedCounts'),
});
