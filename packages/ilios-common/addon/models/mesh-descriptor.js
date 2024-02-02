import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class MeshDescriptor extends Model {
  @attr('string')
  name;

  @attr('string')
  annotation;

  @attr('date')
  createdAt;

  @attr('date')
  updatedAt;

  @attr('boolean')
  deleted;

  @hasMany('course', { async: true, inverse: 'meshDescriptors' })
  courses;

  @hasMany('session', { async: true, inverse: 'meshDescriptors' })
  sessions;

  @hasMany('mesh-concept', { async: true, inverse: 'descriptors' })
  concepts;

  @hasMany('mesh-qualifier', { async: true, inverse: 'descriptors' })
  qualifiers;

  @hasMany('mesh-tree', { async: true, inverse: 'descriptor' })
  trees;

  @hasMany('session-learning-material', {
    async: true,
    inverse: 'meshDescriptors',
  })
  sessionLearningMaterials;

  @hasMany('course-learning-material', { async: true, inverse: 'meshDescriptors' })
  courseLearningMaterials;

  @belongsTo('mesh-previous-indexing', { async: true, inverse: 'descriptor' })
  previousIndexing;

  @hasMany('session-objective', { async: true, inverse: 'meshDescriptors' })
  sessionObjectives;

  @hasMany('course-objective', { async: true, inverse: 'meshDescriptors' })
  courseObjectives;

  @hasMany('program-year-objective', { async: true, inverse: 'meshDescriptors' })
  programYearObjectives;
}
