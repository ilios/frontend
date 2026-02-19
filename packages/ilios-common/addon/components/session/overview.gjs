import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import { uniqueId, array } from '@ember/helper';
import Header from 'ilios-common/components/session/header';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import t from 'ember-intl/helpers/t';
import formatDate from 'ember-intl/helpers/format-date';
import { LinkTo } from '@ember/routing';
import EditableField from 'ilios-common/components/editable-field';
import { on } from '@ember/modifier';
import { eq, notEq } from 'ember-truth-helpers';
import Ilm from 'ilios-common/components/session/ilm';
import PostrequisiteEditor from 'ilios-common/components/session/postrequisite-editor';
import toggle from 'ilios-common/helpers/toggle';
import sub_ from 'ember-math-helpers/helpers/sub';
import perform from 'ember-concurrency/helpers/perform';
import HtmlEditor from 'ilios-common/components/html-editor';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import join from 'ilios-common/helpers/join';
import mapBy from 'ilios-common/helpers/map-by';
import FadeText from 'ilios-common/components/fade-text';
import focus from 'ilios-common/modifiers/focus';
import { faClockRotateLeft, faCopy, faSquareUpRight } from '@fortawesome/free-solid-svg-icons';

export default class SessionOverview extends Component {
  @service currentUser;
  @service router;
  @service permissionChecker;
  @service intl;
  @service store;

  @tracked localInstructionalNotes;
  @tracked localDescription;
  @tracked localSessionType;
  @tracked isEditingPostRequisite = false;
  @tracked descriptionFadeTextExpanded = false;
  @tracked notesFadeTextExpanded = false;

  validations = new YupValidations(this, {
    instructionalNotes: string().nullable().min(3).max(65000),
    description: string().nullable().min(3).max(65000),
  });

  @cached
  get prerequisitesData() {
    return new TrackedAsyncData(this.args.session.prerequisites);
  }

  @cached
  get postrequisiteData() {
    return new TrackedAsyncData(this.args.session.postrequisite);
  }

  @cached
  get postrequisiteCourseData() {
    return new TrackedAsyncData(this.postrequisite?.course);
  }

  @cached
  get sessionTypeData() {
    return new TrackedAsyncData(this.args.session.sessionType);
  }

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.session.course);
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.courseData.isResolved ? this.courseData.value.school : null);
  }

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(
      this.schoolData.isResolved ? this.schoolData.value?.sessionTypes : null,
    );
  }

  get sessionTypes() {
    if (!this.sessionTypesData.isResolved || !this.sessionTypesData.value) {
      return [];
    }

    return this.sessionTypesData.value;
  }

  @cached
  get showAttendanceRequiredData() {
    return new TrackedAsyncData(
      this.schoolData.isResolved
        ? this.schoolData.value?.getConfigValue('showSessionAttendanceRequired')
        : false,
    );
  }

  @cached
  get showSupplementalData() {
    return new TrackedAsyncData(
      this.schoolData.isResolved
        ? this.schoolData.value?.getConfigValue('showSessionSupplemental')
        : false,
    );
  }

  @cached
  get showSpecialAttireRequiredData() {
    return new TrackedAsyncData(
      this.schoolData.isResolved
        ? this.schoolData.value?.getConfigValue('showSessionSpecialAttireRequired')
        : false,
    );
  }

  @cached
  get showSpecialEquipmentRequiredData() {
    return new TrackedAsyncData(
      this.schoolData.isResolved
        ? this.schoolData.value?.getConfigValue('showSessionSpecialEquipmentRequired')
        : false,
    );
  }

  get showAttendanceRequired() {
    return this.showAttendanceRequiredData.isResolved
      ? this.showAttendanceRequiredData.value
      : false;
  }

  get showSupplemental() {
    return this.showSupplementalData.isResolved ? this.showSupplementalData.value : false;
  }

  get showSpecialAttireRequired() {
    return this.showSpecialAttireRequiredData.isResolved
      ? this.showSpecialAttireRequiredData.value
      : false;
  }

  get showSpecialEquipmentRequired() {
    return this.showSpecialEquipmentRequiredData.isResolved
      ? this.showSpecialEquipmentRequiredData.value
      : false;
  }

  @cached
  get showCopyData() {
    return new TrackedAsyncData(this.getShowCopy(this.args.session));
  }

  get showCopy() {
    return this.showCopyData.isResolved ? this.showCopyData.value : false;
  }

  get prerequisites() {
    return this.prerequisitesData.isResolved ? this.prerequisitesData.value : null;
  }

  get postrequisite() {
    return this.postrequisiteData.isResolved ? this.postrequisiteData.value : null;
  }

  get postrequisiteCourse() {
    return this.postrequisiteCourseData.isResolved ? this.postrequisiteCourseData.value : null;
  }

  get filteredSessionTypes() {
    const selectedSessionTypeId = isEmpty(this.sessionType) ? -1 : this.sessionType.id;
    return this.sessionTypes.filter((sessionType) => {
      return sessionType.active || sessionType.id === selectedSessionTypeId;
    });
  }

  get sortedSessionTypes() {
    return sortBy(this.filteredSessionTypes, 'title');
  }

  get instructionalNotes() {
    const instructionalNotes =
      this.localInstructionalNotes === undefined
        ? this.args.session.instructionalNotes
        : this.localInstructionalNotes;
    if (instructionalNotes === '') {
      return null;
    }

    return instructionalNotes;
  }

  get description() {
    const description =
      this.localDescription === undefined ? this.args.session.description : this.localDescription;
    if (description === '') {
      return null;
    }

    return description;
  }

  get sessionType() {
    if (this.localSessionType === undefined) {
      return this.sessionTypeData.isResolved ? this.sessionTypeData.value : null;
    }
    return this.localSessionType;
  }

  get isLoaded() {
    return (
      this.sessionTypesData.isResolved &&
      this.sessionTypeData.isResolved &&
      this.showAttendanceRequiredData.isResolved &&
      this.showSupplementalData.isResolved &&
      this.showSpecialAttireRequiredData.isResolved &&
      this.showSpecialEquipmentRequiredData.isResolved &&
      this.showCopyData.isResolved
    );
  }

  get sessionAttributeDisabled() {
    if (!this.args.editable) {
      return true;
    }

    return this.toggleSessionAttribute.isRunning;
  }

  /**
   * Check if a user is allowed to create a session anywhere
   * Try and do this by loading as little data as possible, but in the
   * end we do need to check every course in the school.
   */
  async getShowCopy(session) {
    if (this.router.currentRouteName === 'session.copy') {
      return false;
    }

    const course = await session.course;
    if (await this.permissionChecker.canCreateSession(course)) {
      return true;
    }
    const user = await this.currentUser.getModel();
    const allRelatedCourses = await user.allRelatedCourses;
    let relatedCourse;
    for (relatedCourse of allRelatedCourses) {
      if (await this.permissionChecker.canCreateSession(relatedCourse)) {
        return true;
      }
    }
    const school = await course.school;
    const schoolCourses = await school.courses;
    let schoolCourse;
    for (schoolCourse of schoolCourses) {
      if (await this.permissionChecker.canCreateSession(schoolCourse)) {
        return true;
      }
    }

    return false;
  }

  @action
  expandAllDescriptionFadeText(isExpanded) {
    this.descriptionFadeTextExpanded = isExpanded;
  }

  @action
  expandAllNotesFadeText(isExpanded) {
    this.notesFadeTextExpanded = isExpanded;
  }

  @action
  revertInstructionalNotesChanges() {
    this.localInstructionalNotes = undefined;
  }

  @action
  setSessionType(event) {
    this.localSessionType = findById(this.sessionTypes, event.target.value);
  }

  @action
  changeSessionType() {
    this.args.session.sessionType = this.sessionType;
    this.args.session.save();
    this.localSessionType = undefined;
  }

  @action
  async revertSessionTypeChanges() {
    this.localSessionType = undefined;
  }

  toggleSessionAttribute = task(async (attribute, { target }) => {
    this.args.session[attribute] = target.checked;
    await this.args.session.save();
  });

  saveDescription = task(async () => {
    this.validations.addErrorDisplayFor('description');
    const isValid = await this.validations.isValid();

    if (!isValid) {
      return false;
    }

    this.validations.removeErrorDisplayFor('description');
    this.args.session.description = this.description;
    await this.args.session.save();
    this.localDescription = undefined;
  });

  @action
  changeDescription(html) {
    this.validations.addErrorDisplayFor('description');
    const noTagsText = html.replace(/(<([^>]+)>)/gi, '');
    const strippedText = noTagsText.replace(/&nbsp;/gi, '').replace(/\s/g, '');

    //if all we have is empty html then save null
    if (strippedText.length === 0) {
      html = null;
    }

    this.localDescription = html;
  }

  @action
  revertDescriptionChanges() {
    this.localDescription = undefined;
  }

  @action
  changeInstructionalNotes(html) {
    this.validations.addErrorDisplayFor('instructionalNotes');
    const noTagsText = html.replace(/(<([^>]+)>)/gi, '');
    const strippedText = noTagsText.replace(/&nbsp;/gi, '').replace(/\s/g, '');

    //if all we have is empty html then save null
    if (strippedText.length === 0) {
      html = null;
    }
    this.localInstructionalNotes = html;
  }

  saveInstructionalNotes = task(async () => {
    this.validations.addErrorDisplayFor('instructionalNotes');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('instructionalNotes');
    this.args.session.instructionalNotes = this.instructionalNotes;

    await this.args.session.save();
    this.localInstructionalNotes = undefined;
  });
  <template>
    <div data-test-session-overview>
      {{#let (uniqueId) as |templateId|}}
        {{#if this.isLoaded}}
          <Header @session={{@session}} @editable={{@editable}} @hideCheckLink={{@hideCheckLink}} />

          <section class="session-overview">
            <div class="last-update" data-test-last-update>
              <FaIcon @icon={{faClockRotateLeft}} @title={{t "general.lastUpdate"}} />
              {{t "general.lastUpdate"}}:
              {{formatDate
                @session.updatedAt
                month="2-digit"
                day="2-digit"
                year="numeric"
                hour="2-digit"
                minute="2-digit"
              }}
            </div>

            <div class="session-overview-header">

              <div class="title">
                {{t "general.overview"}}
              </div>

              <div class="session-overview-actions">
                {{#if this.showCopy}}
                  <LinkTo
                    @route="session.copy"
                    @models={{array @session.course @session}}
                    class="copy"
                    title={{t "general.copySession"}}
                    data-test-copy
                  >
                    <FaIcon @icon={{faCopy}} @fixedWidth={{true}} />
                  </LinkTo>
                {{/if}}
              </div>
            </div>

            <div class="session-overview-content">
              <div class="sessiontype block" data-test-session-type>
                <label for="session-type-{{templateId}}">{{t "general.sessionType"}}:</label>
                <span>
                  {{#if @editable}}
                    <EditableField
                      @value={{this.sessionType.title}}
                      @save={{this.changeSessionType}}
                      @close={{this.revertSessionTypeChanges}}
                    >
                      <select
                        id="session-type-{{templateId}}"
                        {{on "change" this.setSessionType}}
                        {{focus}}
                      >
                        {{#each this.sortedSessionTypes as |sessionType|}}
                          <option
                            value={{sessionType.id}}
                            selected={{eq sessionType.id this.sessionType.id}}
                          >
                            {{sessionType.title}}
                          </option>
                        {{/each}}
                      </select>
                    </EditableField>
                    {{#unless this.sessionType.active}}
                      <em>({{t "general.inactive"}})</em>
                    {{/unless}}
                  {{else}}
                    {{@session.sessionType.title}}
                    {{#unless this.sessionType.active}}
                      <em>({{t "general.inactive"}})</em>
                    {{/unless}}
                  {{/if}}
                </span>
              </div>
              <fieldset class="session-attributes">
                <legend>{{t "general.sessionAttributes"}}</legend>
                {{#if this.showSupplemental}}
                  <label data-test-supplemental>
                    <input
                      type="checkbox"
                      checked={{@session.supplemental}}
                      disabled={{this.sessionAttributeDisabled}}
                      {{on "change" (perform this.toggleSessionAttribute "supplemental")}}
                    />
                    {{t "general.supplementalCurriculum"}}
                  </label>
                {{/if}}
                {{#if this.showSpecialAttireRequired}}
                  <label data-test-special-attire>
                    <input
                      type="checkbox"
                      checked={{@session.attireRequired}}
                      disabled={{this.sessionAttributeDisabled}}
                      {{on "change" (perform this.toggleSessionAttribute "attireRequired")}}
                    />
                    {{t "general.specialAttireRequired"}}
                  </label>
                {{/if}}
                {{#if this.showSpecialEquipmentRequired}}
                  <label data-test-special-equipment>
                    <input
                      type="checkbox"
                      checked={{@session.equipmentRequired}}
                      disabled={{this.sessionAttributeDisabled}}
                      {{on "change" (perform this.toggleSessionAttribute "equipmentRequired")}}
                    />
                    {{t "general.specialEquipmentRequired"}}
                  </label>
                {{/if}}
                {{#if this.showAttendanceRequired}}
                  <label data-test-attendance-required>
                    <input
                      type="checkbox"
                      checked={{@session.attendanceRequired}}
                      disabled={{this.sessionAttributeDisabled}}
                      {{on "change" (perform this.toggleSessionAttribute "attendanceRequired")}}
                    />
                    {{t "general.attendanceRequired"}}
                  </label>
                {{/if}}
              </fieldset>
              <Ilm @session={{@session}} @editable={{@editable}} />
              <div class="postrequisite block" data-test-postrequisite>
                {{#if @editable}}
                  {{#if this.isEditingPostRequisite}}
                    <PostrequisiteEditor
                      @session={{@session}}
                      @close={{toggle "isEditingPostRequisite" this}}
                    />
                  {{else}}
                    <label>
                      {{#if @session.hasPostrequisite}}
                        <LinkTo
                          @route="session.index"
                          @models={{array this.postrequisiteCourse this.postrequisite}}
                        >
                          <FaIcon @icon={{faSquareUpRight}} />
                          {{t "general.duePriorTo"}}:
                        </LinkTo>
                      {{else}}
                        {{t "general.duePriorTo"}}:
                      {{/if}}
                    </label>
                    <button
                      class="link-button"
                      type="button"
                      {{on "click" (toggle "isEditingPostRequisite" this)}}
                      data-test-edit
                    >
                      {{#if @session.hasPostrequisite}}
                        {{@session.postrequisite.title}}
                      {{else}}
                        {{t "general.none"}}
                      {{/if}}
                    </button>
                  {{/if}}
                {{else}}
                  <label>
                    {{#if @session.hasPostrequisite}}
                      <LinkTo
                        @route="session.index"
                        @models={{array this.postrequisiteCourse this.postrequisite}}
                      >
                        <FaIcon @icon={{faSquareUpRight}} />
                        {{t "general.duePriorTo"}}:
                      </LinkTo>>
                    {{else}}
                      {{t "general.duePriorTo"}}:
                    {{/if}}
                  </label>
                  {{#if @session.hasPostrequisite}}
                    {{@session.postrequisite.title}}
                  {{else}}
                    {{t "general.none"}}
                  {{/if}}
                {{/if}}
              </div>
              <div class="prerequisites block" data-test-prerequisites>
                <label>{{t "general.prerequisites"}}:</label>
                {{#if @session.hasPrerequisites}}
                  <span>
                    {{#each this.prerequisites as |prerequisite index|~}}<LinkTo
                        @route="session.index"
                        @models={{array prerequisite.course prerequisite}}
                      ><FaIcon @icon={{faSquareUpRight}} /> {{prerequisite.title}}</LinkTo>{{#if
                        (notEq index (sub_ this.prerequisites.length 1))
                      }}, {{/if}}{{~/each}}
                  </span>
                {{else}}
                  {{t "general.none"}}
                {{/if}}
              </div>
              <div class="sessiondescription normalize-external-editor" data-test-description>
                <label>{{t "general.description"}}:</label>
                <FadeText @text={{this.description}} as |ft|>
                  {{#if @editable}}
                    <EditableField
                      @value={{this.description}}
                      @isSaveDisabled={{this.validations.errors.description}}
                      @save={{perform this.saveDescription}}
                      @close={{this.revertDescriptionChanges}}
                      @clickPrompt={{t "general.clickToEdit"}}
                    >
                      <:default>
                        <HtmlEditor
                          @content={{this.description}}
                          @update={{this.changeDescription}}
                          @autofocus={{true}}
                        />
                        <YupValidationMessage
                          @description={{t "general.description"}}
                          @validationErrors={{this.validations.errors.description}}
                        />
                      </:default>
                      <:value>
                        {{ft.text}}
                      </:value>
                      <:postValue>
                        {{ft.controls}}
                      </:postValue>
                    </EditableField>
                  {{else}}
                    {{ft.text preserveLinks=true}}
                    {{ft.controls}}
                  {{/if}}
                </FadeText>
              </div>
              <div
                class="instructional-notes normalize-external-editor"
                data-test-instructional-notes
              >
                <label>{{t "general.instructionalNotes"}}:</label>
                <FadeText @text={{this.instructionalNotes}} as |ft|>
                  {{#if @editable}}
                    <EditableField
                      @value={{this.instructionalNotes}}
                      @isSaveDisabled={{this.validations.errors.instructionalNotes}}
                      @save={{perform this.saveInstructionalNotes}}
                      @close={{this.revertInstructionalNotesChanges}}
                      @clickPrompt={{t "general.clickToEdit"}}
                    >
                      <:default>
                        <HtmlEditor
                          @content={{this.instructionalNotes}}
                          @update={{this.changeInstructionalNotes}}
                          @autofocus={{true}}
                        />
                        <YupValidationMessage
                          @description={{t "general.instructionalNotes"}}
                          @validationErrors={{this.validations.errors.instructionalNotes}}
                        />
                      </:default>
                      <:value>
                        {{ft.text}}
                      </:value>
                      <:postValue>
                        {{ft.controls}}
                      </:postValue>
                    </EditableField>
                  {{else}}
                    {{ft.text preserveLinks=true}}
                    {{ft.controls}}
                  {{/if}}
                </FadeText>
              </div>
              {{#unless this.isIndependentLearning}}
                <br />
                <div class="sessionassociatedgroups" data-test-associated-groups>
                  <label>{{t "general.associatedGroups"}}:</label>
                  <span>
                    {{#if @session.associatedOfferingLearnerGroups}}
                      {{join ", " (mapBy "title" @session.associatedOfferingLearnerGroups)}}
                    {{else}}
                      {{t "general.none"}}
                    {{/if}}
                  </span>
                </div>
              {{/unless}}
            </div>
          </section>
        {{/if}}
      {{/let}}
    </div>
  </template>
}
