import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  session: belongsTo('session', { inverse: 'learningMaterials' }),
  learningMaterial: belongsTo('learning-material', { inverse: 'sessionLearningMaterials' }),
  meshDescriptors: hasMany('mesh-descriptor', { inverse: 'sessionLearningMaterials' }),
});
