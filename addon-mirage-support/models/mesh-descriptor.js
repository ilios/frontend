import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  courses: hasMany('course', { inverse: 'meshDescriptors' }),
  sessions: hasMany('session', { inverse: 'meshDescriptors' }),
  concepts: hasMany('mesh-concept', { inverse: 'descriptors' }),
  qualifiers: hasMany('mesh-qualifier', { inverse: 'descriptors' }),
  trees: hasMany('mesh-tree', { inverse: 'descriptor' }),
  sessionLearningMaterials: hasMany('session-learning-material', { inverse: 'meshDescriptors' }),
  courseLearningMaterials: hasMany('course-learning-material', { inverse: 'meshDescriptors' }),
  previousIndexing: belongsTo('mesh-previous-indexing', { inverse: 'descriptor' }),
  sessionObjectives: hasMany('session-objective', { inverse: 'meshDescriptors' }),
  courseObjectives: hasMany('course-objective', { inverse: 'meshDescriptors' }),
  programYearObjectives: hasMany('program-year-objective', { inverse: 'meshDescriptors' }),
});
