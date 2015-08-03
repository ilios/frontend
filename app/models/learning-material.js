import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  title: DS.attr('string'),
  description: DS.attr('string'),
  uploadDate: DS.attr('date'),
  originalAuthor: DS.attr('string'),
  type: Ember.computed('filename', 'citation', 'link', function(){
    if (this.get('filename')) {
      return 'file';
    }
    if (this.get('citation')) {
      return 'citation';
    }
    if (this.get('link')) {
      return 'link';
    }
  }),
  token: DS.attr('string'),
  path: DS.attr('string'),
  copyrightPermission: DS.attr('boolean'),
  copyrightRationale: DS.attr('string'),
  filename: DS.attr('string'),
  fileHash: DS.attr('string'),
  mimetype: DS.attr('string'),
  filesize: DS.attr('number'),
  link: DS.attr('string'),
  citation: DS.attr('string'),
  userRole: DS.belongsTo('learning-material-user-role', {async: true}),
  status: DS.belongsTo('learning-material-status', {async: true}),
  owningUser: DS.belongsTo('user', {async: true}),
  courseLearningMaterials: DS.hasMany('course-learning-material', {async: true}),
  sessionLearningMaterials: DS.hasMany('session-learning-material', {async: true}),

});
