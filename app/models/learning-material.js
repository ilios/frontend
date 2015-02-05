import DS from 'ember-data';
//[userRole,status,owningUser,,text,type]
export default DS.Model.extend({
  title: DS.attr('string'),
  description: DS.attr('string'),
  uploadDate: DS.attr('date'),
  originalAuthor: DS.attr('string'),
  text: DS.attr('string'),
  type: DS.attr('string'),
  token: DS.attr('string'),
  webLink: DS.attr('string'),
  userRole: DS.belongsTo('learning-material-user-role', {async: true}),
  status: DS.belongsTo('learning-material-status', {async: true}),
  owningUser: DS.belongsTo('user', {async: true}),
  courseLearningMaterials: DS.hasMany('course-learning-material', {async: true}),
  sessionLearningMaterials: DS.hasMany('session-learning-material', {async: true}),

});
