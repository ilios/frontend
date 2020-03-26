import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency-decorators';
import { validatable, Length, NotBlank, IsTrue } from 'ilios-common/decorators/validation';
import { ValidateIf } from "class-validator";
import { guidFor } from '@ember/object/internals';

@validatable
export default class NewLearningmaterialComponent extends Component {
  @service store;
  @service currentUser;
  @service iliosConfig;

  @ValidateIf(o => o.isFile) @NotBlank() @tracked filename;
  @ValidateIf(o => o.isFile) @NotBlank() @tracked fileHash;
  @tracked statusId;
  @tracked userRoleId;
  @tracked description;
  @NotBlank() @Length(2, 80) @tracked originalAuthor;
  @NotBlank() @Length(4, 120) @tracked title;
  @ValidateIf(o => o.isLink) @NotBlank() @tracked link = 'http://';
  @ValidateIf(o => o.isFile && !o.copyrightRationale) @IsTrue() @tracked copyrightPermission = false;
  @ValidateIf(o => o.isFile) @Length(2, 65000) @tracked copyrightRationale;
  @tracked owner;
  @ValidateIf(o => o.isCitation) @NotBlank() @tracked citation;
  @tracked fileUploadErrorMessage = false;

  get uniqueId() {
    return guidFor(this);
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
      return this.args.learningMaterialStatuses.findBy('id', this.statusId);
    }

    return this.args.learningMaterialStatuses.findBy('title', 'Final');
  }

  get selectedUserRole() {
    if (!this.args.learningMaterialUserRoles) {
      return null;
    }

    if (this.userRoleId) {
      return this.args.learningMaterialUserRoles.findBy('id', this.userRoleId);
    }

    return this.args.learningMaterialUserRoles.get('firstObject');
  }

  @dropTask
  * prepareSave() {
    this.addErrorDisplayForAllFields();
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    const owningUser = yield this.currentUser.getModel();

    const learningMaterial = this.store.createRecord('learningMaterial', {
      title: this.title,
      status: this.selectedStatus,
      userRole: this.selectedUserRole,
      description: this.description,
      originalAuthor: this.originalAuthor,
      owningUser,
    });
    switch(this.args.type){
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

    yield this.args.save(learningMaterial);
    this.clearErrorDisplay();
  }

  @action
  changeStatusId(event) {
    this.statusId = event.target.value;
  }

  @action
  changeUserRoleId(event) {
    this.userRoleId = event.target.value;
  }
}
