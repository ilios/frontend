import { computed } from '@ember/object';
import DS from 'ember-data';

const { attr, belongsTo, hasMany, Model } = DS;

export default Model.extend({
  title: attr('string'),
  description: attr('string'),
  uploadDate: attr('date'),
  originalAuthor: attr('string'),
  citation: attr('string'),
  copyrightPermission: attr('boolean'),
  copyrightRationale: attr('string'),
  filename: attr('string'),
  mimetype: attr('string'),
  filesize: attr('number'),
  link: attr('string'),
  absoluteFileUri: attr('string'),
  userRole: belongsTo('learning-material-user-role', {async: true}),
  status: belongsTo('learning-material-status', {async: true}),
  owningUser: belongsTo('user', {async: true}),
  sessionLearningMaterials: hasMany('session-learning-material', {async: true}),
  courseLearningMaterials: hasMany('course-learning-material', {async: true}),
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
