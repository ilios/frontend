import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';

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
  userRole: belongsTo('learning-material-user-role', { async: true }),
  status: belongsTo('learning-material-status', { async: true }),
  owningUser: belongsTo('user', { async: true }),
  sessionLearningMaterials: hasMany('session-learning-material', {
    async: true,
  }),
  courseLearningMaterials: hasMany('course-learning-material', { async: true }),
  type: computed('filename', 'citation', 'link', function () {
    if (this.filename) {
      return 'file';
    }
    if (this.citation) {
      return 'citation';
    }
    if (this.link) {
      return 'link';
    }

    return null;
  }),
  url: computed('absoluteFileUri', 'citation', 'link', 'type', function () {
    if (this.type === 'file') {
      return this.absoluteFileUri;
    }
    if (this.type === 'link') {
      return this.link;
    }

    return null;
  }),
  isFile: computed.equal('type', 'file'),
  isLink: computed.equal('type', 'link'),
  isCitation: computed.equal('type', 'citation'),
  fileHash: null,
});
