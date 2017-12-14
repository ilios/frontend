import DS from 'ember-data';

const { attr, belongsTo, hasMany, Model } = DS;

export default Model.extend({
  name: attr('string'),
  annotation: attr('string'),
  createdAt: attr('date'),
  updatedAt: attr('date'),
  deleted: attr('boolean'),
  courses: hasMany('course', {async: true}),
  objectives: hasMany('objectives', {async: true}),
  sessions: hasMany('session', {async: true}),
  concepts: hasMany('mesh-concept', {async: true}),
  qualifiers: hasMany('mesh-qualifier', {async: true}),
  trees: hasMany('mesh-tree', {async: true}),
  sessionLearningMaterials: hasMany('session-learning-material', {async: true}),
  courseLearningMaterials: hasMany('course-learning-material', {async: true}),
  previousIndexing: belongsTo('mesh-previous-indexing', {async: true}),
});
