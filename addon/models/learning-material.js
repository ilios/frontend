import { computed } from '@ember/object';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  description: DS.attr('string'),
  uploadDate: DS.attr('date'),
  originalAuthor: DS.attr('string'),
  citation: DS.attr('string'),
  copyrightPermission: DS.attr('boolean'),
  copyrightRationale: DS.attr('string'),
  filename: DS.attr('string'),
  mimetype: DS.attr('string'),
  filesize: DS.attr('number'),
  link: DS.attr('string'),
  absoluteFileUri: DS.attr('string'),
  userRole: DS.belongsTo('learning-material-user-role', {async: true}),
  status: DS.belongsTo('learning-material-status', {async: true}),
  owningUser: DS.belongsTo('user', {async: true}),
  sessionLearningMaterials: DS.hasMany('session-learning-material', {async: true}),
  courseLearningMaterials: DS.hasMany('course-learning-material', {async: true}),
  type: computed('filename', 'citation', 'link', function(){
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
  url: computed('link', 'citation', 'absoluteFileUri', function(){
    if(this.get('type') === 'file'){
      return this.get('absoluteFileUri');
    }
    if(this.get('type') === 'link'){
      return this.get('link');
    }
    if(this.get('type') === 'citation'){
      return null;
    }

  }),
  isFile: computed('type', function() {
    return (this.get('type') === 'file');
  }),
  isLink: computed('type', function() {
    return (this.get('type') === 'link');
  }),
  isCitation: computed('type', function() {
    return (this.get('type') === 'citation');
  }),
  fileHash: null,
});
