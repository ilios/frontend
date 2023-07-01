import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  userRole: belongsTo('learning-material-user-role', { inverse: null }),
  status: belongsTo('learning-material-status', { inverse: null }),
  owningUser: belongsTo('user', { inverse: null }),
  sessionLearningMaterials: hasMany('session-learning-material', { inverse: 'learningMaterial' }),
  courseLearningMaterials: hasMany('course-learning-material', { inverse: 'learningMaterial' }),
});
