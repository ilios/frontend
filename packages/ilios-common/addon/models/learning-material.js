import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class LearningMaterial extends Model {
  @attr('string')
  title;
  @attr('string')
  description;
  @attr('date')
  uploadDate;
  @attr('string')
  originalAuthor;
  @attr('string')
  citation;
  @attr('boolean')
  copyrightPermission;
  @attr('string')
  copyrightRationale;
  @attr('string')
  filename;
  @attr('string')
  mimetype;
  @attr('number')
  filesize;
  @attr('string')
  link;
  @attr('string')
  absoluteFileUri;
  @belongsTo('learning-material-user-role', { async: true, inverse: null })
  userRole;
  @belongsTo('learning-material-status', { async: true, inverse: null })
  status;
  @belongsTo('user', { async: true, inverse: null })
  owningUser;
  @hasMany('session-learning-material', { async: true, inverse: 'learningMaterial' })
  sessionLearningMaterials;
  @hasMany('course-learning-material', { async: true, inverse: 'learningMaterial' })
  courseLearningMaterials;

  get type() {
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
  }

  get url() {
    if (this.type === 'file') {
      return this.absoluteFileUri;
    }
    if (this.type === 'link') {
      return this.link;
    }

    return null;
  }

  get isFile() {
    return 'file' === this.type;
  }

  get isLink() {
    return 'link' === this.type;
  }

  get isCitation() {
    return 'citation' === this.type;
  }

  fileHash = null;
}
