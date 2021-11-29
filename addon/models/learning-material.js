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
  @belongsTo('learning-material-user-role', { async: true })
  userRole;
  @belongsTo('learning-material-status', { async: true })
  status;
  @belongsTo('user', { async: true })
  owningUser;
  @hasMany('session-learning-material', { async: true })
  sessionLearningMaterials;
  @hasMany('course-learning-material', { async: true })
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
