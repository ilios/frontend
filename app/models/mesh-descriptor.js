import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  //alias name to title since that is the standard for nearly every other model
  title: Ember.computed.alias("name"),
  name: DS.attr('string'),
  annotation: DS.attr('string'),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),
  objectives: DS.hasMany('objectives',  {async: true}),
  courses: DS.hasMany('course',  {async: true}),
  sessions: DS.hasMany('session',  {async: true}),
  concepts: DS.hasMany('mesh-concept',  {async: true}),
  qualifiers: DS.hasMany('mesh-qualifier',  {async: true}),
  sessionLearningMaterials: DS.hasMany('session-learning-material',  {async: true}),
  courseLearningMaterials: DS.hasMany('course-learning-material',  {async: true}),
});
