import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  administrator: DS.belongsTo('user', {async: true}),
  sessions: DS.hasMany('session', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  programs: DS.hasMany('program', {async: true}),
  programYears: DS.hasMany('program-year', {async: true}),
  relatedCounts: Ember.computed.collect(
    'session.length',
    'courses.length',
    'programs.length',
    'programYears.length'
  ),
  totalRelated: Ember.computed.sum('relatedCounts'),
});
