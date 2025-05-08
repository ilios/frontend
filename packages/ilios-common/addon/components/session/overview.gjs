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

  @action
  changeSupplemental(value) {
    this.args.session.supplemental = value;
    this.args.session.save();
  }

  @action
  changeSpecialEquipment(value) {
    this.args.session.equipmentRequired = value;
    this.args.session.save();
  }

  @action
  changeSpecialAttire(value) {
    this.args.session.attireRequired = value;
    this.args.session.save();
  }

  @action
  changeAttendanceRequired(value) {
    this.args.session.attendanceRequired = value;
    this.args.session.save();
  }

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
}

<div data-test-session-overview>
  {{#let (unique-id) as |templateId|}}
    {{#if this.isLoaded}}
      <Session::Header
        @session={{@session}}
        @editable={{@editable}}
        @hideCheckLink={{@hideCheckLink}}
      />

      <section class="session-overview">
        <div class="last-update" data-test-last-update>
          <FaIcon @icon="clock-rotate-left" @title={{t "general.lastUpdate"}} />
          {{t "general.lastUpdate"}}:
          {{format-date
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
                data-test-copy
              >
                <FaIcon @icon="copy" @title={{t "general.copySession"}} @fixedWidth={{true}} />
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
                  <select id="session-type-{{templateId}}" {{on "change" this.setSessionType}}>
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
          {{#if this.showSupplemental}}
            <div class="sessionsupplemental block" data-test-supplemental>
              <label>{{t "general.supplementalCurriculum"}}:</label>
              <span>
                {{#if @editable}}
                  <ToggleYesno @yes={{@session.supplemental}} @toggle={{this.changeSupplemental}} />
                {{else}}
                  {{#if @session.supplemental}}
                    <span class="add">{{t "general.yes"}}</span>
                  {{else}}
                    <span class="remove">{{t "general.no"}}</span>
                  {{/if}}
                {{/if}}
              </span>
            </div>
          {{/if}}
          {{#if this.showSpecialAttireRequired}}
            <div class="sessionspecialattire block" data-test-special-attire>
              <label>{{t "general.specialAttireRequired"}}:</label>
              <span>
                {{#if @editable}}
                  <ToggleYesno
                    @yes={{@session.attireRequired}}
                    @toggle={{this.changeSpecialAttire}}
                  />
                {{else}}
                  {{#if @session.attireRequired}}
                    <span class="add">{{t "general.yes"}}</span>
                  {{else}}
                    <span class="remove">{{t "general.no"}}</span>
                  {{/if}}
                {{/if}}
              </span>
            </div>
          {{/if}}
          {{#if this.showSpecialEquipmentRequired}}
            <div class="sessionspecialequipment block" data-test-special-equipment>
              <label>{{t "general.specialEquipmentRequired"}}:</label>
              <span>
                {{#if @editable}}
                  <ToggleYesno
                    @yes={{@session.equipmentRequired}}
                    @toggle={{this.changeSpecialEquipment}}
                  />
                {{else}}
                  {{#if @session.equipmentRequired}}
                    <span class="add">{{t "general.yes"}}</span>
                  {{else}}
                    <span class="remove">{{t "general.no"}}</span>
                  {{/if}}
                {{/if}}
              </span>
            </div>
          {{/if}}
          {{#if this.showAttendanceRequired}}
            <div class="sessionattendancerequired block" data-test-attendance-required>
              <label>{{t "general.attendanceRequired"}}:</label>
              <span>
                {{#if @editable}}
                  <ToggleYesno
                    @yes={{@session.attendanceRequired}}
                    @toggle={{this.changeAttendanceRequired}}
                  />
                {{else}}
                  {{#if @session.attendanceRequired}}
                    <span class="add">{{t "general.yes"}}</span>
                  {{else}}
                    <span class="remove">{{t "general.no"}}</span>
                  {{/if}}
                {{/if}}
              </span>
            </div>
          {{/if}}
          <hr />
          <Session::Ilm @session={{@session}} @editable={{@editable}} />
          <div class="postrequisite block" data-test-postrequisite>
            {{#if @editable}}
              {{#if this.isEditingPostRequisite}}
                <Session::PostrequisiteEditor
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
                      <FaIcon @icon="square-up-right" />
                      {{t "general.duePriorTo"}}:
                    </LinkTo>
                  {{else}}
                    {{t "general.duePriorTo"}}:
                  {{/if}}
                </label>
                <button
                  class="post-requisite-edit"
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
                    <FaIcon @icon="square-up-right" />
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
                  ><FaIcon @icon="square-up-right" /> {{prerequisite.title}}</LinkTo>{{#if
                    (not-eq index (sub this.prerequisites.length 1))
                  }}, {{/if}}{{~/each}}
              </span>
            {{else}}
              {{t "general.none"}}
            {{/if}}
          </div>
          <hr />
          <div class="sessiondescription" data-test-description>
            <label>{{t "general.description"}}:</label>
            <span>
              {{#if @editable}}
                <EditableField
                  @value={{this.description}}
                  @renderHtml={{true}}
                  @isSaveDisabled={{this.validations.errors.description}}
                  @save={{perform this.saveDescription}}
                  @close={{this.revertDescriptionChanges}}
                  @clickPrompt={{t "general.clickToEdit"}}
                >
                  <HtmlEditor @content={{this.description}} @update={{this.changeDescription}} />
                  <YupValidationMessage
                    @description={{t "general.description"}}
                    @validationErrors={{this.validations.errors.description}}
                  />
                </EditableField>
              {{else}}
                {{! template-lint-disable no-triple-curlies}}
                {{{this.description}}}
              {{/if}}
            </span>
          </div>
          <div class="instructional-notes" data-test-instructional-notes>
            <label>{{t "general.instructionalNotes"}}:</label>
            <span>
              {{#if @editable}}
                <EditableField
                  @value={{@session.instructionalNotes}}
                  @renderHtml={{true}}
                  @isSaveDisabled={{this.validations.errors.instructionalNotes}}
                  @save={{perform this.saveInstructionalNotes}}
                  @close={{this.revertInstructionalNotesChanges}}
                  @clickPrompt={{t "general.clickToEdit"}}
                >
                  <HtmlEditor
                    @content={{this.instructionalNotes}}
                    @update={{this.changeInstructionalNotes}}
                  />
                  <YupValidationMessage
                    @description={{t "general.instructionalNotes"}}
                    @validationErrors={{this.validations.errors.instructionalNotes}}
                  />
                </EditableField>
              {{else}}
                {{! template-lint-disable no-triple-curlies}}
                {{{this.instructionalNotes}}}
              {{/if}}
            </span>
          </div>
          {{#unless this.isIndependentLearning}}
            <br />
            <div class="sessionassociatedgroups" data-test-associated-groups>
              <label>{{t "general.associatedGroups"}}:</label>
              <span>
                {{#if @session.associatedOfferingLearnerGroups}}
                  {{join ", " (map-by "title" @session.associatedOfferingLearnerGroups)}}
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