import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  annotation: DS.attr('string'),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),
  deleted: DS.attr('boolean'),
  courses: DS.hasMany('course', {async: true}),
  objectives: DS.hasMany('objectives', {async: true}),
  sessions: DS.hasMany('session', {async: true}),
  concepts: DS.hasMany('mesh-concept', {async: true}),
  qualifiers: DS.hasMany('mesh-qualifier', {async: true}),
  trees: DS.hasMany('mesh-tree', {async: true}),
  sessionLearningMaterials: DS.hasMany('session-learning-material', {async: true}),
  courseLearningMaterials: DS.hasMany('course-learning-material', {async: true}),
  previousIndexing: DS.belongsTo('mesh-previous-indexing', {async: true}),
});
