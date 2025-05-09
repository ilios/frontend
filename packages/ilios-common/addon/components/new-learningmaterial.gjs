import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { findBy, findById } from 'ilios-common/utils/array-helpers';
import YupValidations from 'ilios-common/classes/yup-validations';
import { boolean, string } from 'yup';
import { uniqueId, fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import isEqual from 'ember-truth-helpers/helpers/is-equal';
import UserNameInfo from 'ilios-common/components/user-name-info';
import HtmlEditor from 'ilios-common/components/html-editor';
import not from 'ember-truth-helpers/helpers/not';
import perform from 'ember-concurrency/helpers/perform';
import LearningMaterialUploader from 'ilios-common/components/learning-material-uploader';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

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
  <template>
    <div class="new-learningmaterial" data-test-new-learningmaterial>
      {{#let (uniqueId) as |templateId|}}
        <div class="item">
          <label for="display-name-{{templateId}}">
            {{t "general.displayName"}}:
          </label>
          <span>
            <input
              id="display-name-{{templateId}}"
              disabled={{this.prepareSave.isRunning}}
              type="text"
              value={{this.title}}
              {{on "input" (pick "target.value" (set this "title"))}}
              {{this.validations.attach "title"}}
            />
            <YupValidationMessage
              @description={{t "general.title"}}
              @validationErrors={{this.validations.errors.title}}
              data-test-title-validation-error-message
            />
          </span>
        </div>
        <div class="item">
          <label for="status-{{templateId}}">
            {{t "general.status"}}:
          </label>
          <span>
            <select id="status-{{templateId}}" {{on "change" this.changeStatusId}}>
              {{#each @learningMaterialStatuses as |lmStatus|}}
                <option value={{lmStatus.id}} selected={{isEqual lmStatus this.selectedStatus}}>
                  {{lmStatus.title}}
                </option>
              {{/each}}
            </select>
          </span>
        </div>
        <div class="item" data-test-owninguser>
          <label>
            {{t "general.owner"}}:
          </label>
          <span class="owninguser">
            <UserNameInfo @user={{this.currentUserModel}} />
          </span>
        </div>
        <div class="item">
          <label for="original-author-{{templateId}}">
            {{t "general.contentAuthor"}}:
          </label>
          <span>
            <input
              id="original-author-{{templateId}}"
              disabled={{this.prepareSave.isRunning}}
              type="text"
              value={{this.originalAuthor}}
              {{on "input" (pick "target.value" (set this "originalAuthor"))}}
              {{this.validations.attach "originalAuthor"}}
            />
            <YupValidationMessage
              @description={{t "general.contentAuthor"}}
              @validationErrors={{this.validations.errors.originalAuthor}}
              data-test-author-validation-error-message
            />
          </span>
        </div>
        <div class="item">
          <label for="user-role-{{templateId}}">
            {{t "general.userRole"}}:
          </label>
          <span>
            <select id="user-role-{{templateId}}" {{on "change" this.changeUserRoleId}}>
              {{#each @learningMaterialUserRoles as |role|}}
                <option value={{role.id}} selected={{isEqual role this.selectedUserRole}}>
                  {{role.title}}
                </option>
              {{/each}}
            </select>
          </span>
        </div>
        {{#if this.isLink}}
          <div class="item" data-test-link>
            <label for="url-{{templateId}}">
              {{t "general.url"}}:
            </label>
            <span>
              {{! template-lint-disable no-bare-strings}}
              <input
                id="url-{{templateId}}"
                type="text"
                placeholder="https://example.com"
                value={{this.bestLink}}
                inputmode="url"
                disabled={{this.prepareSave.isRunning}}
                {{on "input" (pick "target.value" this.changeLink)}}
                {{on "focus" this.selectAllText}}
                {{this.validations.attach "link"}}
              />
              <YupValidationMessage @validationErrors={{this.validations.errors.link}} />
            </span>
          </div>
        {{/if}}
        {{#if this.isCitation}}
          <div class="item">
            <label for="citation-{{templateId}}">
              {{t "general.citation"}}:
            </label>
            <span class="citation">
              <textarea
                id="citation-{{templateId}}"
                disabled={{this.prepareSave.isRunning}}
                {{on "input" (pick "target.value" (set this "citation"))}}
                {{this.validations.attach "citation"}}
              >{{this.citation}}</textarea>
              <YupValidationMessage
                @description={{t "general.citation"}}
                @validationErrors={{this.validations.errors.citation}}
              />
            </span>
          </div>
        {{/if}}
        <div class="item">
          <label>
            {{t "general.description"}}:
          </label>
          <span>
            <HtmlEditor @content={{this.description}} @update={{fn (mut this.description)}} />
          </span>
        </div>
        {{#if this.isFile}}
          <div class="item">
            <label for="copyright-permission-{{templateId}}">
              {{t "general.copyrightPermission"}}:
            </label>
            <span>
              <p id="lm-copyright-agreement-text">
                <input
                  id="copyright-permission-{{templateId}}"
                  type="checkbox"
                  checked={{this.copyrightPermission}}
                  {{on "click" (set this "copyrightPermission" (not this.copyrightPermission))}}
                  {{on "change" (perform this.validations.runValidator)}}
                  data-test-copyright-agreement
                />
                {{t "general.copyrightAgreement"}}
                {{#if this.validations.errors.copyrightPermission}}
                  <br />
                  <span
                    class="validation-error-message"
                    data-test-agreement-validation-error-message
                  >
                    {{t "errors.agreementRequired"}}
                  </span>
                {{/if}}
              </p>
            </span>
          </div>
          {{#unless this.copyrightPermission}}
            <div class="item">
              <label for="copyright-rationale-{{templateId}}">
                {{t "general.copyrightRationale"}}:
              </label>
              <span>
                <textarea
                  id="copyright-rationale-{{templateId}}"
                  {{on "input" (pick "target.value" (set this "copyrightRationale"))}}
                  {{this.validations.attach "copyrightRationale"}}
                  data-test-copyright-rationale
                >{{this.copyrightRationale}}</textarea>
                <YupValidationMessage
                  @description={{t "general.copyrightRationale"}}
                  @validationErrors={{this.validations.errors.copyrightRationale}}
                />
              </span>
            </div>
          {{/unless}}
          <div class="item" data-test-file>
            <label>
              {{t "general.file"}}:
            </label>
            <LearningMaterialUploader
              @for="file-upload-{{this.templateId}}"
              @setFilename={{set this "filename"}}
              @setFileHash={{set this "fileHash"}}
            />
            <YupValidationMessage
              @description={{t "general.file"}}
              @validationErrors={{this.validations.errors.filename}}
            />
          </div>
        {{/if}}
        <div class="buttons">
          <button class="done text" type="button" {{on "click" (perform this.prepareSave)}}>
            {{#if this.prepareSave.isRunning}}
              <LoadingSpinner />
            {{else}}
              {{t "general.done"}}
            {{/if}}
          </button>
          <button class="cancel text" type="button" {{on "click" @cancel}}>
            {{t "general.cancel"}}
          </button>
        </div>
      {{/let}}
    </div>
  </template>
}
