import Component from '@glimmer/component';
import { dropTask, restartableTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { DateTime } from 'luxon';
import { findById } from 'ilios-common/utils/array-helpers';
import YupValidations from 'ilios-common/classes/yup-validations';
import { date, string } from 'yup';

export default class LearningMaterialManagerComponent extends Component {
  @service store;
  @service flashMessages;
  @service intl;

  constructor() {
    super(...arguments);
    this.loadExistingData();
  }

  validations = new YupValidations(this, {
    title: string().required().min(4).max(120),
    startDate: date().notRequired(),
    endDate: date()
      .notRequired()
      .when('startDate', {
        is: (startDate) => !!startDate, // Check if the startDate field has a value
        then: (schema) =>
          schema.test(
            'is-end-date-after-start-date',
            (d) => {
              return {
                path: d.path,
                messageKey: 'errors.after',
                values: {
                  after: this.intl.t('general.startDate'),
                },
              };
            },
            (value) => {
              if (!value) {
                return true;
              }
              return (
                DateTime.fromJSDate(value).diff(DateTime.fromJSDate(this.startDate), 'minutes') > 1
              );
            },
          ),
      }),
  });

  @tracked isLoaded = false;

  @tracked notes;
  @tracked learningMaterial;
  @tracked title;
  @tracked endDate;
  @tracked type;
  @tracked owningUser;
  @tracked originalAuthor;
  @tracked description;
  @tracked copyrightPermission;
  @tracked copyrightRationale;
  @tracked citation;
  @tracked link;
  @tracked mimetype;
  @tracked absoluteFileUri;
  @tracked filename;
  @tracked uploadDate;
  @tracked closeManager;
  @tracked terms;
  @tracked startDate;
  @tracked parentMaterial;
  @tracked statusId;
  @tracked userRoleTitle;
  @tracked publicNotes;
  @tracked required;

  get isFile() {
    return this.type === 'file';
  }
  get isLink() {
    return this.type === 'link';
  }
  get isCitation() {
    return this.type === 'citation';
  }

  defaultTime = DateTime.fromObject({
    hour: 8,
    minute: 0,
    second: 0,
  }).toJSDate();

  updateOtherDate = (originalDate, value) => {
    const otherDate = DateTime.fromJSDate(value);
    this[originalDate] = DateTime.fromObject({
      month: otherDate.month,
      day: otherDate.day,
      hour: 8,
      minute: 0,
      second: 0,
    }).toJSDate();
  };

  @action
  updateDate(which, value) {
    const { hour, minute } = DateTime.fromJSDate(this[which]);
    const { year, ordinal } = DateTime.fromJSDate(value);
    this[which] = DateTime.fromObject({
      year,
      ordinal,
      hour,
      minute,
      second: 0,
    }).toJSDate();

    if (which == 'startDate' && this['endDate']) {
      if (DateTime.fromJSDate(value) > DateTime.fromJSDate(this['endDate'])) {
        this.updateOtherDate('endDate', value);
      }
    }

    if (which == 'endDate' && this['startDate']) {
      if (DateTime.fromJSDate(value) < DateTime.fromJSDate(this['startDate'])) {
        this.updateOtherDate('startDate', value);
      }
    }
  }
  @action
  updateTime(which, value, type) {
    let { year, ordinal, hour, minute } = DateTime.fromJSDate(this[which]);

    if (type === 'hour') {
      hour = value;
    }
    if (type === 'minute') {
      minute = value;
    }

    this[which] = DateTime.fromObject({
      year: year,
      ordinal: ordinal,
      hour: hour,
      minute: minute,
      second: 0,
    }).toJSDate();

    this.validations.addErrorDisplayFor(which);
  }

  @action
  addDate(which) {
    if (which == 'endDate') {
      if (this['startDate']) {
        this.updateOtherDate('endDate', this['startDate']);
      } else {
        this[which] = this.defaultTime;
      }
    } else {
      if (which == 'startDate') {
        if (this['endDate']) {
          this.updateOtherDate('startDate', this['endDate']);
        } else {
          this[which] = this.defaultTime;
        }
      }
    }
  }
  @action
  addTerm(term) {
    this.terms = [...this.terms, term];
  }
  @action
  removeTerm(term) {
    this.terms = this.terms.filter((obj) => obj !== term);
  }
  @action
  updateStatusId(event) {
    this.statusId = event.target.value;
  }

  get courseLearningMaterialIds() {
    if (!this.parentMaterial) {
      return [];
    }
    return this.parentMaterial.hasMany('courseLearningMaterials').ids();
  }

  get sessionLearningMaterialIds() {
    if (!this.parentMaterial) {
      return [];
    }
    return this.parentMaterial.hasMany('sessionLearningMaterials').ids();
  }

  /**
   * Whether the given learning material is linked to no more than one session or course.
   */
  get isLinkedOnlyOnce() {
    return this.courseLearningMaterialIds.length + this.sessionLearningMaterialIds.length === 1;
  }

  get currentStatus() {
    return findById(this.args.learningMaterialStatuses, this.statusId);
  }

  async loadExistingData() {
    if (!this.args.learningMaterial) {
      throw new Error('LearningMaterialManagerComponent requires a learningMaterial argument');
    }
    const { learningMaterial } = this.args;
    const parentMaterial = await learningMaterial.learningMaterial;
    this.notes = learningMaterial.notes;
    this.required = learningMaterial.required;
    this.publicNotes = learningMaterial.publicNotes;
    this.startDate = learningMaterial.startDate;
    this.endDate = learningMaterial.endDate;

    this.terms = await learningMaterial.meshDescriptors;
    this.parentMaterial = parentMaterial;
    this.type = parentMaterial.type;
    this.title = parentMaterial.title;
    this.originalAuthor = parentMaterial.originalAuthor;
    this.description = parentMaterial.description;
    this.copyrightPermission = parentMaterial.copyrightPermission;
    this.copyrightRationale = parentMaterial.copyrightRationale;
    this.citation = parentMaterial.citation;
    this.link = parentMaterial.link;
    this.mimetype = parentMaterial.mimetype;
    this.absoluteFileUri = parentMaterial.absoluteFileUri;
    this.filename = parentMaterial.filename;
    this.uploadDate = parentMaterial.uploadDate;

    const status = await parentMaterial.status;
    this.statusId = status.id;
    this.owningUser = await parentMaterial.owningUser;
    const userRole = await parentMaterial.userRole;
    this.userRoleTitle = userRole.title;

    this.isLoaded = true;
  }

  save = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();

    this.args.learningMaterial.set('publicNotes', this.publicNotes);
    this.args.learningMaterial.set('required', this.required);
    this.args.learningMaterial.set('notes', this.notes);
    this.args.learningMaterial.set('startDate', this.startDate);
    this.args.learningMaterial.set('endDate', this.endDate);

    this.parentMaterial.set('status', this.currentStatus);
    this.parentMaterial.set('title', this.title);
    this.parentMaterial.set('description', this.description);

    this.args.learningMaterial.set('meshDescriptors', this.terms);
    await this.args.learningMaterial.save();
    await this.parentMaterial.save();
    this.args.closeManager();
  });

  textCopied = restartableTask(async () => {
    this.flashMessages.success('general.copiedSuccessfully');
  });
}
