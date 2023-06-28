import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  session: belongsTo('session', { inverse: 'learningMaterials' }),
  terms: belongsTo('learning-material', { inverse: 'sessionLearningMaterials' }),
  meshDescriptors: hasMany('mesh-descriptor', { inverse: 'sessionLearningMaterials' }),
});
