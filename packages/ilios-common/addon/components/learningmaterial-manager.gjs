import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { DateTime } from 'luxon';
import { findById } from 'ilios-common/utils/array-helpers';
import YupValidations from 'ilios-common/classes/yup-validations';
import { date, string } from 'yup';
import { uniqueId, fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import and from 'ember-truth-helpers/helpers/and';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import eq from 'ember-truth-helpers/helpers/eq';
import ToggleYesno from 'ilios-common/components/toggle-yesno';
import HtmlEditor from 'ilios-common/components/html-editor';
import UserNameInfo from 'ilios-common/components/user-name-info';
import CopyButton from 'ilios-common/components/copy-button';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import formatDate from 'ember-intl/helpers/format-date';
import TimedReleaseSchedule from 'ilios-common/components/timed-release-schedule';
import DatePicker from 'ilios-common/components/date-picker';
import TimePicker from 'ilios-common/components/time-picker';
import MeshManager from 'ilios-common/components/mesh-manager';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import { faCopy, faDownload } from '@fortawesome/free-solid-svg-icons';

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

  save = task({ drop: true }, async () => {
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

  textCopied = task({ restartable: true }, async () => {
    this.flashMessages.success(this.intl.t('general.copiedSuccessfully'));
  });

  getLearningMaterialLink = () => {
    return this.link;
  };
  getLearningMaterialAbsoluteFileUri = () => {
    return this.absoluteFileUri;
  };
  <template>
    <div class="learningmaterial-manager">
      {{#if this.isLoaded}}
        {{#let (uniqueId) as |templateId|}}
          <div class="item displayname">
            <label for="displayname-{{templateId}}">
              {{t "general.displayName"}}:
            </label>
            {{#if (and @editable this.isLinkedOnlyOnce)}}
              <input
                id="displayname-{{templateId}}"
                type="text"
                value={{this.title}}
                disabled={{this.save.isRunning}}
                {{this.validations.attach "title"}}
                {{on "input" (pick "target.value" (set this "title"))}}
              />
              <YupValidationMessage
                @description={{t "general.title"}}
                @validationErrors={{this.validations.errors.title}}
                data-test-title-validation-error-message
              />
            {{else}}
              <span>
                {{this.title}}
              </span>
            {{/if}}
          </div>
          <div class="item status required">
            <div>
              <label for="status-{{templateId}}">
                {{t "general.status"}}:
              </label>
              {{#if @editable}}
                <select id="status-{{templateId}}" {{on "change" this.updateStatusId}}>
                  {{#each @learningMaterialStatuses as |status|}}
                    <option
                      value={{status.id}}
                      selected={{eq status.id this.statusId}}
                    >{{status.title}}</option>
                  {{/each}}
                </select>
              {{else}}
                {{this.currentStatus.title}}
              {{/if}}
            </div>

            <div>
              <label>
                {{t "general.required"}}:
              </label>
              {{#if @editable}}
                <ToggleYesno @yes={{this.required}} @toggle={{set this "required"}} />
              {{else if this.required}}
                <span class="add">
                  {{t "general.yes"}}
                </span>
              {{else}}
                <span class="remove">
                  {{t "general.no"}}
                </span>
              {{/if}}
            </div>
          </div>

          <div class="item">
            <label>
              {{t "general.description"}}:
            </label>
            <span class="description normalize-external-editor">
              {{#if (and @editable this.isLinkedOnlyOnce)}}
                <HtmlEditor @content={{this.description}} @update={{set this "description"}} />
              {{else}}
                {{! template-lint-disable no-triple-curlies }}
                <span>
                  {{{this.description}}}
                </span>
              {{/if}}
            </span>
          </div>
          <div class="item">
            <div class="notes normalize-external-editor">
              <label>
                {{t "general.instructionalNotes"}}:
              </label>
              {{#if @editable}}
                <HtmlEditor @content={{this.notes}} @update={{set this "notes"}} />
              {{else}}
                <span>
                  {{! template-lint-disable no-triple-curlies }}
                  {{{this.notes}}}
                </span>
              {{/if}}
            </div>

            <div class="publicnotes">
              <label>
                {{t "general.showNotesToStudents"}}:
              </label>
              {{#if @editable}}
                <ToggleYesno @yes={{this.publicNotes}} @toggle={{set this "publicNotes"}} />
              {{else if this.publicNotes}}
                <span class="add">
                  {{t "general.yes"}}
                </span>
              {{else}}
                <span class="remove">
                  {{t "general.no"}}
                </span>
              {{/if}}
            </div>
          </div>

          <div class="item">
            <label>
              {{t "general.owner"}}:
            </label>
            <span class="owninguser">
              <UserNameInfo @user={{this.owningUser}} />
            </span>
          </div>
          <div class="item">
            <label>
              {{t "general.contentAuthor"}}:
            </label>
            <span class="originalauthor">
              {{this.originalAuthor}}
            </span>
          </div>
          <div class="item">
            <label>
              {{t "general.userRole"}}:
            </label>
            <span class="userrole">
              {{this.userRoleTitle}}
            </span>
          </div>

          {{#if this.isFile}}
            <div class="item filename">
              <label>
                {{t "general.file"}}:
              </label>
              <span class="downloadurl">
                {{#if (eq this.mimetype "application/pdf")}}
                  <a href="{{this.absoluteFileUri}}?inline">{{this.filename}}</a>
                  <a href={{this.absoluteFileUri}} target="_blank" rel="noopener noreferrer">
                    <FaIcon @icon={{faDownload}} @title={{t "general.download"}} />
                  </a>
                {{else}}
                  <a href={{this.absoluteFileUri}} target="_blank" rel="noopener noreferrer">
                    {{this.filename}}
                  </a>
                {{/if}}
                <CopyButton
                  @getClipboardText={{this.getLearningMaterialAbsoluteFileUri}}
                  @success={{perform this.textCopied}}
                  title={{t "general.copyLink"}}
                >
                  <FaIcon @icon={{faCopy}} />
                </CopyButton>
              </span>
            </div>
          {{/if}}
          {{#if this.isLink}}
            <div class="item weblink">
              <label>
                {{t "general.link"}}:
              </label>
              <span class="link">
                <a href={{this.link}} target="_blank" rel="noopener noreferrer">{{this.link}}</a>
                <CopyButton
                  @getClipboardText={{this.getLearningMaterialLink}}
                  @success={{perform this.textCopied}}
                  title={{t "general.copyLink"}}
                >
                  <FaIcon @icon={{faCopy}} />
                </CopyButton>
              </span>
            </div>
          {{/if}}
          {{#if this.isCitation}}
            <div class="item">
              <label>
                {{t "general.citation"}}:
              </label>
              <span class="citation">
                {{this.citation}}
              </span>
            </div>
          {{/if}}

          <div class="item">
            <label>
              {{t "general.uploadDate"}}:
            </label>
            <span class="upload-date">
              {{formatDate this.uploadDate day="2-digit" month="2-digit" year="numeric"}}
            </span>
          </div>

          {{#if this.copyrightPermission}}
            <div class="item">
              <label>
                {{t "general.copyrightPermission"}}:
              </label>
              {{#if this.copyrightPermission}}
                <span class="copyrightpermission add">
                  {{t "general.yes"}}
                </span>
              {{else}}
                <span class="copyrightpermission remove">
                  {{t "general.no"}}
                </span>
              {{/if}}
            </div>
          {{/if}}
          {{#if this.copyrightRationale}}
            <div class="item">
              <label>
                {{t "general.copyrightRationale"}}:
              </label>
              <span class="copyrightrationale">
                {{this.copyrightRationale}}
              </span>
            </div>
          {{/if}}

          <div class="item timed-release">
            <label>
              {{t "general.timedRelease"}}:
            </label>
            <TimedReleaseSchedule @startDate={{this.startDate}} @endDate={{this.endDate}} />
            <div class="timed-release-dates">
              <div class="timed-release-start">
                {{#if this.startDate}}
                  <div class="item start">
                    <div class="start-date">
                      <label>
                        {{t "general.startDate"}}:
                      </label>
                      {{#if @editable}}
                        <DatePicker
                          @value={{this.startDate}}
                          @onChange={{fn this.updateDate "startDate"}}
                        />
                      {{else}}
                        {{formatDate this.startDate day="2-digit" month="2-digit" year="numeric"}}
                      {{/if}}
                    </div>
                    <div class="start-time">
                      <label>
                        {{t "general.startTime"}}:
                      </label>
                      {{#if @editable}}
                        <TimePicker
                          @date={{this.startDate}}
                          @action={{fn this.updateTime "startDate"}}
                        />
                      {{else}}
                        {{formatDate
                          this.startDate
                          day="2-digit"
                          month="2-digit"
                          year="numeric"
                          hour12=true
                          hour="2-digit"
                          minute="2-digit"
                        }}
                      {{/if}}
                    </div>
                  </div>
                  {{#if @editable}}
                    <button
                      class="remove-date"
                      type="button"
                      {{on "click" (fn (set this "startDate") null)}}
                    >
                      {{t "general.timedReleaseClearStartDate"}}
                    </button>
                  {{/if}}
                {{else if @editable}}
                  <p>
                    <button
                      class="add-date"
                      type="button"
                      data-test-add-start-date
                      {{on "click" (fn this.addDate "startDate")}}
                    >
                      {{t "general.timedReleaseAddStartDate"}}
                    </button>
                  </p>
                {{/if}}
              </div>
              <div class="timed-release-end">
                {{#if this.endDate}}
                  <div class="item end">
                    <div class="end-date">
                      <label>
                        {{t "general.endDate"}}:
                      </label>
                      {{#if @editable}}
                        <DatePicker
                          @value={{this.endDate}}
                          @onChange={{fn this.updateDate "endDate"}}
                        />
                      {{else}}
                        {{formatDate this.endDate day="2-digit" month="2-digit" year="numeric"}}
                      {{/if}}
                    </div>
                    <div class="end-time">
                      <label>
                        {{t "general.endTime"}}:
                      </label>
                      {{#if @editable}}
                        <TimePicker
                          @date={{this.endDate}}
                          @action={{fn this.updateTime "endDate"}}
                        />
                      {{else}}
                        {{formatDate
                          this.endDate
                          day="2-digit"
                          month="2-digit"
                          year="numeric"
                          hour12=true
                          hour="2-digit"
                          minute="2-digit"
                        }}
                      {{/if}}
                    </div>
                    <YupValidationMessage
                      @description={{t "general.endDate"}}
                      @validationErrors={{this.validations.errors.endDate}}
                      data-test-end-date-validation-error-message
                    />
                  </div>
                  {{#if @editable}}
                    <button
                      class="remove-date"
                      type="button"
                      {{on "click" (fn (set this "endDate") null)}}
                    >
                      {{t "general.timedReleaseClearEndDate"}}
                    </button>
                  {{/if}}
                {{else if @editable}}
                  <p>
                    <button
                      class="add-date"
                      type="button"
                      data-test-add-end-date
                      {{on "click" (fn this.addDate "endDate")}}
                    >
                      {{t "general.timedReleaseAddEndDate"}}
                    </button>
                  </p>
                {{/if}}
              </div>
            </div>
          </div>

          <MeshManager
            @terms={{this.terms}}
            @editable={{@editable}}
            @add={{this.addTerm}}
            @remove={{this.removeTerm}}
            @targetItemTitle={{this.title}}
          />
          <div class="buttons">
            {{#if @editable}}
              <button
                class="done"
                type="button"
                disabled={{this.save.isRunning}}
                {{on "click" (perform this.save)}}
              >
                {{#if this.save.isRunning}}
                  <LoadingSpinner />
                {{else}}
                  {{t "general.done"}}
                {{/if}}
              </button>
              <button class="cancel" type="button" {{on "click" @closeManager}}>
                {{t "general.cancel"}}
              </button>
            {{else}}
              <button type="button" {{on "click" @closeManager}}>
                {{t "general.close"}}
              </button>
            {{/if}}
          </div>
        {{/let}}
      {{/if}}
    </div>
  </template>
}
