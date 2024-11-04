import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import {
  validatable,
  Custom,
  Length,
  NotBlank,
  IsTrue,
  IsURL,
} from 'ilios-common/decorators/validation';
import { ValidateIf } from 'class-validator';
import { TrackedAsyncData } from 'ember-async-data';
import { findBy, findById } from 'ilios-common/utils/array-helpers';

const DEFAULT_URL_VALUE = 'https://';

@validatable
export default class NewLearningmaterialComponent extends Component {
  @service store;
  @service currentUser;
  @service iliosConfig;
  @service intl;
  @ValidateIf((o) => o.isFile)
  @Custom('validateFilenameCallback', 'validateFilenameMessageCallback')
  @tracked
  filename;
  @ValidateIf((o) => o.isFile) @NotBlank() @tracked fileHash;
  @tracked statusId;
  @tracked userRoleId;
  @tracked description;
  @NotBlank() @Length(2, 80) @tracked originalAuthor;
  @NotBlank() @Length(4, 120) @tracked title;
  @ValidateIf((o) => o.isLink)
  @NotBlank()
  @IsURL()
  @Length(1, 256)
  @tracked
  link = DEFAULT_URL_VALUE;
  @ValidateIf((o) => o.isFile && !o.copyrightRationale)
  @IsTrue()
  @tracked
  copyrightPermission = false;
  @ValidateIf((o) => o.isFile) @Length(2, 65000) @tracked copyrightRationale;
  @tracked owner;
  @ValidateIf((o) => o.isCitation) @NotBlank() @tracked citation;
  @tracked fileUploadErrorMessage = false;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get hasErrorForCopyrightPermissionData() {
    return new TrackedAsyncData(this.hasErrorFor('copyrightPermission'));
  }

  get hasErrorForCopyrightPermission() {
    return this.hasErrorForCopyrightPermissionData.isResolved
      ? this.hasErrorForCopyrightPermissionData.value
      : false;
  }

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
    this.addErrorDisplayForAllFields();
    const isValid = await this.isValid();
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
    this.clearErrorDisplay();
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

  validateFilenameCallback() {
    if (typeof this.filename === 'string') {
      return this.filename.trim() !== '';
    }
    return this.filename !== null && this.filename !== undefined;
  }

  validateFilenameMessageCallback() {
    return this.intl.t('errors.missingFile');
  }
}
