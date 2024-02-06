import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  course: belongsTo('course', { inverse: 'learningMaterials' }),
  learningMaterial: belongsTo('learning-material', { inverse: 'courseLearningMaterials' }),
  meshDescriptors: hasMany('mesh-descriptors', { inverse: 'courseLearningMaterials' }),
});
