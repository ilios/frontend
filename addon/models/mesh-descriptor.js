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

  @hasMany('course', { async: true })
  courses;

  @hasMany('session', { async: true })
  sessions;

  @hasMany('mesh-concept', { async: true })
  concepts;

  @hasMany('mesh-qualifier', { async: true })
  qualifiers;

  @hasMany('mesh-tree', { async: true })
  trees;

  @hasMany('session-learning-material', {
    async: true,
  })
  sessionLearningMaterials;

  @hasMany('course-learning-material', { async: true })
  courseLearningMaterials;

  @belongsTo('mesh-previous-indexing', { async: true })
  previousIndexing;

  @hasMany('session-objective', { async: true })
  sessionObjectives;

  @hasMany('course-objective', { async: true })
  courseObjectives;

  @hasMany('program-year-objective', { async: true })
  programYearObjectives;
}
