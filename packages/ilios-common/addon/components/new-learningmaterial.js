import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { findBy, findById } from 'ilios-common/utils/array-helpers';
import YupValidations from 'ilios-common/classes/yup-validations';
import { boolean, string } from 'yup';

const DEFAULT_URL_VALUE = 'https://';

export default class NewLearningmaterialComponent extends Component {
  @service store;
  @service currentUser;
  @service iliosConfig;
  @service intl;
  @tracked filename;
  @tracked fileHash;
  @tracked statusId;
  @tracked userRoleId;
  @tracked description;
  @tracked originalAuthor;
  @tracked title;
  @tracked link = DEFAULT_URL_VALUE;
  @tracked copyrightPermission = false;
  @tracked copyrightRationale;
  @tracked owner;
  @tracked citation;
  @tracked fileUploadErrorMessage = false;

  validations = new YupValidations(this, {
    originalAuthor: string().required().min(2).max(80),
    title: string().required().min(4).max(120),
    link: string().when('$isLink', {
      is: true,
      then: (schema) => schema.required().url().max(256),
    }),
    citation: string().when('$isCitation', {
      is: true,
      then: (schema) => schema.required(),
    }),
    filename: string()
      .nullable()
      .when('$isFile', {
        is: true,
        then: (schema) =>
          schema.test(
            'is-filename-valid',
            (d) => {
              return {
                path: d.path,
                messageKey: 'errors.missingFile',
              };
            },
            (value) => value !== null && value !== undefined && value.trim() !== '',
          ),
      }),
    copyrightRationale: string().when(
      ['$isFile', 'copyrightPermission'],
      ([isFile, copyrightPermission], schema) => {
        if (isFile && !copyrightPermission) {
          return schema.required().min(2).max(65000);
        }
      },
    ),
    copyrightPermission: boolean().when('$isFile', {
      is: true,
      then: (schema) =>
        schema.test(
          'is-true',
          (d) => {
            return {
              path: d.path,
              messageKey: 'errors.agreementRequired',
            };
          },
          (value) => this.copyrightRationale || value === true,
        ),
    }),
    fileHash: string()
      .nullable()
      .when('$isFile', {
        is: true,
        then: (schema) => schema.required(),
      }),
  });
  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get currentUserModel() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  get isFile() {
    return this.args.type === 'file';
  }

  get isCitation() {
    return this.args.type === 'citation';
  }

  get isLink() {
    return this.args.type === 'link';
  }

  get selectedStatus() {
    if (!this.args.learningMaterialStatuses) {
      return null;
    }

    if (this.statusId) {
      return findById(this.args.learningMaterialStatuses, this.statusId);
    }

    return findBy(this.args.learningMaterialStatuses, 'title', 'Final');
  }

  get selectedUserRole() {
    if (!this.args.learningMaterialUserRoles) {
      return null;
    }

    if (this.userRoleId) {
      return findById(this.args.learningMaterialUserRoles, this.userRoleId);
    }

    return this.args.learningMaterialUserRoles[0];
  }

  get bestLink() {
    return this.link ?? DEFAULT_URL_VALUE;
  }

  prepareSave = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    const owningUser = await this.currentUser.getModel();
    const learningMaterial = this.store.createRecord('learning-material', {
      title: this.title,
      status: this.selectedStatus,
      userRole: this.selectedUserRole,
      description: this.description,
      originalAuthor: this.originalAuthor,
      owningUser,
    });
    switch (this.args.type) {
      case 'file': {
        learningMaterial.setProperties({
          copyrightRationale: this.copyrightRationale,
          copyrightPermission: this.copyrightPermission,
          filename: this.filename,
          fileHash: this.fileHash,
        });
        break;
      }
      case 'link': {
        learningMaterial.set('link', this.link);
        break;
      }
      case 'citation': {
        learningMaterial.set('citation', this.citation);
        break;
      }
    }

    await this.args.save(learningMaterial);
    this.validations.clearErrorDisplay();
  });

  @action
  changeStatusId(event) {
    this.statusId = event.target.value;
  }

  @action
  changeUserRoleId(event) {
    this.userRoleId = event.target.value;
  }

  @action
  changeLink(value) {
    value = value.trim();
    const regex = RegExp('https://http[s]?:');
    if (regex.test(value)) {
      value = value.substring(8);
    }
    this.link = value;
  }

  @action
  selectAllText({ target }) {
    if (target.value === DEFAULT_URL_VALUE) {
      target.select();
    }
  }
}
