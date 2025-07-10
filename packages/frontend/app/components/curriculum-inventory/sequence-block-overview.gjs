import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { dropTask } from 'ember-concurrency';
import { all } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { findById } from 'ilios-common/utils/array-helpers';
import YupValidations from 'ilios-common/classes/yup-validations';
import { date, mixed, number } from 'yup';
import { DateTime } from 'luxon';
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import EditableField from 'ilios-common/components/editable-field';
import { on } from '@ember/modifier';
import isEmpty from 'ember-truth-helpers/helpers/is-empty';
import sortBy from 'ilios-common/helpers/sort-by';
import eq from 'ember-truth-helpers/helpers/eq';
import formatDate from 'ember-intl/helpers/format-date';
import perform from 'ember-concurrency/helpers/perform';
import pick from 'ilios-common/helpers/pick';
import ToggleYesno from 'ilios-common/components/toggle-yesno';
import DatePicker from 'ilios-common/components/date-picker';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import set from 'ember-set-helper/helpers/set';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import or from 'ember-truth-helpers/helpers/or';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import SequenceBlockSessionManager from 'frontend/components/curriculum-inventory/sequence-block-session-manager';
import SequenceBlockSessionList from 'frontend/components/curriculum-inventory/sequence-block-session-list';

export default class CurriculumInventorySequenceBlockOverviewComponent extends Component {
  @service intl;
  @service store;

  @tracked childSequenceOrder;
  @tracked description;
  @tracked isEditingDatesAndDuration = false;
  @tracked isEditingMinMax = false;
  @tracked isManagingSessions = false;
  @tracked minimum;
  @tracked maximum;
  @tracked orderInSequence;
  @tracked required;
  @tracked duration;
  @tracked startDate;
  @tracked endDate;
  @tracked selectedCourse;
  @tracked selectedStartLevel;
  @tracked selectedEndLevel;

  constructor() {
    super(...arguments);
    this.required = this.args.sequenceBlock.required.toString();
    this.duration = this.args.sequenceBlock.duration;
    this.startDate = this.args.sequenceBlock.startDate;
    this.endDate = this.args.sequenceBlock.endDate;
    this.childSequenceOrder = this.args.sequenceBlock.childSequenceOrder.toString();
    this.orderInSequence = this.args.sequenceBlock.orderInSequence;
    this.minimum = this.args.sequenceBlock.minimum;
    this.maximum = this.args.sequenceBlock.maximum;
    this.description = this.args.sequenceBlock.description;
  }

  validations = new YupValidations(this, {
    startDate: date().when('$hasZeroDurationOrLinkedCourseIsClerkship', {
      is: true,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired(),
    }),
    endDate: date().when('startDate', {
      is: (startDate) => {
        return !!startDate;
      },
      then: (schema) =>
        schema.required().test(
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
            const startDate = DateTime.fromJSDate(this.startDate);
            const endDate = DateTime.fromJSDate(value);
            return startDate.startOf('day') < endDate.startOf('day');
          },
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
    startLevel: mixed().test(
      'start-level-lte-end-level',
      (d) => {
        return {
          path: d.path,
          messageKey: 'errors.lessThanOrEqualTo',
          values: {
            lte: this.intl.t('general.endLevel'),
          },
        };
      },
      async (value) => {
        const defaultStartLevel = await this.args.sequenceBlock.startingAcademicLevel;
        const defaultEndLevel = await this.args.sequenceBlock.endingAcademicLevel;
        const startLevel = value || defaultStartLevel;
        const endLevel = this.endLevel || defaultEndLevel;
        return endLevel.level >= startLevel.level;
      },
    ),
    endLevel: mixed().test(
      'end-level-gte-start-level',
      (d) => {
        return {
          path: d.path,
          messageKey: 'errors.greaterThanOrEqualTo',
          values: {
            gte: this.intl.t('general.startLevel'),
          },
        };
      },
      async (value) => {
        const defaultStartLevel = await this.args.sequenceBlock.startingAcademicLevel;
        const defaultEndLevel = await this.args.sequenceBlock.endingAcademicLevel;
        const startLevel = this.startLevel || defaultStartLevel;
        const endLevel = value || defaultEndLevel;
        return endLevel.level >= startLevel.level;
      },
    ),
    minimum: number().required().integer().min(0),
    maximum: number()
      .required()
      .integer()
      .min(0)
      .test(
        'more-than-or-equal-to-minimum',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.greaterThanOrEqualTo',
            values: {
              gte: this.intl.t('general.minimum'),
            },
          };
        },
        (value) => {
          const max = parseInt(value, 10) || 0;
          const min = parseInt(this.minimum, 10) || 0;
          return max >= min;
        },
      ),
    duration: number()
      .integer()
      .lessThan(1201)
      .test(
        'clerkship-based-minimum',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.greaterThanOrEqualTo',
            values: {
              gte: this.linkedCourseIsClerkship ? 1 : 0,
            },
          };
        },
        (value) => {
          return this.linkedCourseIsClerkship ? value >= 1 : value >= 0;
        },
      ),
  });

  @cached
  get reportData() {
    return new TrackedAsyncData(this.args.sequenceBlock.report);
  }

  get report() {
    return this.reportData.isResolved ? this.reportData.value : null;
  }

  @cached
  get academicLevelsData() {
    return new TrackedAsyncData(this.report?.academicLevels);
  }

  get academicLevels() {
    return this.academicLevelsData.isResolved ? this.academicLevelsData.value : [];
  }

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.sequenceBlock.course);
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get linkedCourseIsClerkship() {
    if (!this.course) {
      return false;
    }
    return !!this.course.belongsTo('clerkshipType').id();
  }

  @cached
  get linkableCourseData() {
    return new TrackedAsyncData(this.getLinkableCourses(this.report, this.course));
  }

  get linkableCourses() {
    return this.linkableCourseData.isResolved ? this.linkableCourseData.value : [];
  }

  /**
   * Returns a list of courses that can be linked to this sequence block.
   */
  async getLinkableCourses(report, course) {
    if (!report) {
      return [];
    }
    const program = await report.program;
    const schoolId = program.belongsTo('school').id();
    const allLinkableCourses = await this.store.query('course', {
      filters: {
        published: true,
        school: [schoolId],
        year: report.get('year'),
      },
    });
    const linkedCourses = await report.getLinkedCourses();
    // Filter out all courses that are linked to (sequence blocks in) this report.
    const linkableCourses = allLinkableCourses.filter((course) => {
      return !linkedCourses.includes(course);
    });
    // Always add the currently linked course to this list, if existent.
    if (isPresent(course)) {
      linkableCourses.push(course);
    }

    return linkableCourses;
  }

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.getSessions(this.course));
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
  }

  /**
   * Returns a list of published sessions that belong to a given course.
   */
  async getSessions(course) {
    if (!course) {
      return [];
    }
    return await this.store.query('session', {
      filters: {
        course: course.id,
        published: true,
      },
    });
  }

  @cached
  get linkedSessionsData() {
    return new TrackedAsyncData(this.args.sequenceBlock.sessions);
  }

  get linkedSessions() {
    return this.linkedSessionsData.isResolved ? this.linkedSessionsData.value : [];
  }

  @cached
  get excludedSessionsData() {
    return new TrackedAsyncData(this.args.sequenceBlock.excludedSessions);
  }

  get excludedSessions() {
    return this.excludedSessionsData.isResolved ? this.excludedSessionsData.value : [];
  }

  get dataForSessionsManagerLoaded() {
    return (
      this.sessionsData.isResolved &&
      this.linkedSessionsData.isResolved &&
      this.excludedSessionsData.isResolved
    );
  }

  @cached
  get parentData() {
    return new TrackedAsyncData(this.args.sequenceBlock.parent);
  }

  get parent() {
    return this.parentData.isResolved ? this.parentData.value : null;
  }

  @cached
  get selfAndSiblingsData() {
    return new TrackedAsyncData(this.getSelfAndSiblings(this.parent));
  }

  get selfAndSiblings() {
    return this.selfAndSiblingsData.isResolved ? this.selfAndSiblingsData.value : [];
  }

  async getSelfAndSiblings(parent) {
    if (!parent) {
      return [this.args.sequenceBlock];
    }
    return await parent.children;
  }

  get isInOrderedSequence() {
    return this.parent && this.parent.isOrdered;
  }

  get orderInSequenceOptions() {
    const rhett = [];
    for (let i = 0, n = this.selfAndSiblings.length; i < n; i++) {
      const num = i + 1;
      rhett.push(num);
    }
    return rhett;
  }

  get hasZeroDuration() {
    const num = Number(this.duration);
    if (Number.isNaN(num)) {
      return false;
    }
    return 0 === num;
  }

  get hasZeroDurationOrLinkedCourseIsClerkship() {
    return this.hasZeroDuration || this.linkedCourseIsClerkship;
  }

  get requiredLabel() {
    switch (this.required) {
      case '1':
        return this.intl.t('general.required');
      case '2':
        return this.intl.t('general.optionalElective');
      case '3':
        return this.intl.t('general.requiredInTrack');
      default:
        return null;
    }
  }

  get isElective() {
    return '2' === this.required;
  }

  get isSelective() {
    if (this.isElective) {
      return false;
    }
    const minimum = parseInt(this.minimum, 10);
    const maximum = parseInt(this.maximum, 10);
    return minimum > 0 && minimum !== maximum;
  }

  get childSequenceOrderLabel() {
    switch (this.childSequenceOrder) {
      case '1':
        return this.intl.t('general.ordered');
      case '2':
        return this.intl.t('general.unordered');
      case '3':
        return this.intl.t('general.parallel');
      default:
        return null;
    }
  }

  changeRequired = dropTask(async () => {
    this.args.sequenceBlock.required = parseInt(this.required, 10);
    if ('2' === this.required) {
      this.args.sequenceBlock.minimum = 0;
    }
    await this.args.sequenceBlock.save();
  });

  @action
  setRequired(required) {
    this.required = required;
    if ('2' === required) {
      this.minimum = 0;
    } else {
      this.minimum = this.args.sequenceBlock.minimum;
    }
  }

  @action
  revertRequiredChanges() {
    this.required = this.args.sequenceBlock.required.toString();
    this.minimum = this.args.sequenceBlock.minimum;
  }

  @action
  updateCourse(event) {
    const value = event.target.value;
    if (!value) {
      this.selectedCourse = {}; // Use an empty object here to indicate a user selection.
    } else {
      this.selectedCourse = findById(this.linkableCourses, value);
    }
  }

  @action
  async revertCourseChanges() {
    this.selectedCourse = null;
  }

  @action
  async saveCourse() {
    const oldCourse = await this.args.sequenceBlock.course;
    if (oldCourse !== this.selectedCourse) {
      this.args.sequenceBlock.set('sessions', []);
      this.args.sequenceBlock.set('excludedSessions', []);
    }
    this.args.sequenceBlock.set('course', this.selectedCourse.id ? this.selectedCourse : null);
    await this.args.sequenceBlock.save();
  }

  changeTrack = dropTask(async (value) => {
    this.args.sequenceBlock.set('track', value);
    await this.args.sequenceBlock.save();
  });

  saveDescription = dropTask(async () => {
    this.args.sequenceBlock.set('description', this.description);
    await this.args.sequenceBlock.save();
  });

  @action
  revertDescriptionChanges() {
    this.description = this.args.sequenceBlock.get('description');
  }

  changeChildSequenceOrder = dropTask(async () => {
    this.args.sequenceBlock.set('childSequenceOrder', parseInt(this.childSequenceOrder, 10));
    const savedBlock = await this.args.sequenceBlock.save();
    const children = await savedBlock.get('children');
    await all(children.map((child) => child.reload()));
  });

  @action
  revertChildSequenceOrderChanges() {
    this.childSequenceOrder = this.args.sequenceBlock.get('childSequenceOrder').toString();
  }

  changeStartLevel = dropTask(async () => {
    if (!this.startLevel) {
      return;
    }
    const defaultStartLevel = await this.args.sequenceBlock.startingAcademicLevel;
    if (this.startLevel.level === defaultStartLevel.level) {
      return;
    }
    this.validations.addErrorDisplayFor('startLevel');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('startLevel');

    this.args.sequenceBlock.set('startingAcademicLevel', this.startLevel);
    await this.args.sequenceBlock.save();
  });

  @action
  setStartLevel(event) {
    const id = event.target.value;
    this.startLevel = findById(this.academicLevels, id);
  }

  @action
  async revertStartLevelChanges() {
    this.startLevel = await this.args.sequenceBlock.startingAcademicLevel;
    this.validations.removeErrorDisplayFor('startLevel');
  }

  changeEndLevel = dropTask(async () => {
    if (!this.endLevel) {
      return;
    }
    const defaultEndLevel = await this.args.sequenceBlock.endingAcademicLevel;
    if (this.endLevel.level === defaultEndLevel.level) {
      return;
    }
    this.validations.addErrorDisplayFor('endLevel');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('endLevel');
    this.args.sequenceBlock.set('endingAcademicLevel', this.endLevel);
    await this.args.sequenceBlock.save();
  });

  @action
  setEndLevel(event) {
    const id = event.target.value;
    this.endLevel = findById(this.academicLevels, id);
  }

  @action
  async revertEndLevelChanges() {
    this.endLevel = await this.args.sequenceBlock.endingAcademicLevel;
    this.validations.removeErrorDisplayFor('endLevel');
  }

  @action
  updateOrderInSequence(event) {
    this.orderInSequence = parseInt(event.target.value);
  }

  @action
  revertOrderInSequenceChanges() {
    this.orderInSequence = this.args.sequenceBlock.orderInSequence;
  }

  saveOrderInSequenceChanges = dropTask(async () => {
    if (this.orderInSequence === this.args.sequenceBlock.orderInSequence) {
      return;
    }

    this.args.sequenceBlock.set('orderInSequence', this.orderInSequence);
    const savedBlock = await this.args.sequenceBlock.save();
    const parent = await savedBlock.parent;
    const children = await parent.children;
    await all(children.map((child) => child.reload()));
  });

  @action
  editMinMax() {
    this.isEditingMinMax = true;
  }

  @action
  cancelMinMaxEditing() {
    this.minimum = this.args.sequenceBlock.minimum;
    this.maximum = this.args.sequenceBlock.maximum;
    this.validations.removeErrorDisplaysFor(['minimum', 'maximum']);
    this.isEditingMinMax = false;
  }

  @action
  toggleManagingSessions() {
    this.isManagingSessions = !this.isManagingSessions;
  }

  @action
  cancelManagingSessions() {
    this.isManagingSessions = false;
  }

  changeSessions = dropTask(async (sessions, excludedSessions) => {
    this.args.sequenceBlock.set('sessions', sessions);
    this.args.sequenceBlock.set('excludedSessions', excludedSessions);
    await this.args.sequenceBlock.save();
    this.isManagingSessions = false;
  });

  @action
  changeDescription(event) {
    this.description = event.target.value;
  }

  @action
  async saveOrCancelMinMax(ev) {
    const keyCode = ev.keyCode;
    if (13 === keyCode) {
      await this.saveMinMax.perform();
      return;
    }

    if (27 === keyCode) {
      this.isEditingMinMax = false;
    }
  }

  saveMinMax = dropTask(async () => {
    this.validations.addErrorDisplaysFor(['minimum', 'maximum']);
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplaysFor(['minimum', 'maximum']);
    this.args.sequenceBlock.minimum = this.minimum;
    this.args.sequenceBlock.maximum = this.maximum;

    await this.args.sequenceBlock.save();
    this.isEditingMinMax = false;
  });

  @action
  changeStartDate(startDate) {
    this.startDate = startDate;
  }

  @action
  changeEndDate(endDate) {
    this.endDate = endDate;
  }

  saveDuration = dropTask(async () => {
    this.validations.addErrorDisplaysFor(['startDate', 'endDate', 'duration']);
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplaysFor(['startDate', 'endDate', 'duration']);
    this.args.sequenceBlock.startDate = this.startDate;
    this.args.sequenceBlock.endDate = this.endDate;
    this.args.sequenceBlock.duration = this.duration;
    await this.args.sequenceBlock.save();
    this.isEditingDatesAndDuration = false;
  });

  @action
  cancelDurationEditing() {
    this.startDate = this.args.sequenceBlock.startDate;
    this.endDate = this.args.sequenceBlock.endDate;
    this.duration = this.args.sequenceBlock.duration;
    this.validations.removeErrorDisplaysFor(['startDate', 'endDate', 'duration']);
    this.isEditingDatesAndDuration = false;
  }

  @action
  async saveOrCancelDuration(ev) {
    const keyCode = ev.keyCode;
    if (13 === keyCode) {
      await this.saveDuration.perform();
      return;
    }

    if (27 === keyCode) {
      this.isEditingDatesAndDuration = false;
    }
  }
  <template>
    <section
      class="curriculum-inventory-sequence-block-overview"
      data-test-curriculum-inventory-sequence-block-overview
      ...attributes
    >
      {{#let (uniqueId) as |templateId|}}
        <div class="curriculum-inventory-sequence-block-overview-wrapper" data-test-overview>
          <div class="title" data-test-title>{{t "general.overview"}}</div>
          <div class="curriculum-inventory-sequence-block-overview-content">
            <div class="block course" data-test-course>
              <span>
                <label for="course-{{templateId}}">{{t "general.course"}}:</label>
                {{#if @canUpdate}}
                  <EditableField
                    @value={{this.course.title}}
                    @save={{this.saveCourse}}
                    @close={{this.revertCourseChanges}}
                    @clickPrompt={{t "general.selectCourse"}}
                  >
                    <select id="course-{{templateId}}" {{on "change" this.updateCourse}}>
                      <option value selected={{isEmpty this.course}}>{{t
                          "general.selectCourse"
                        }}</option>
                      {{#each (sortBy "title" this.linkableCourses) as |obj|}}
                        <option
                          value={{obj.id}}
                          selected={{eq obj this.course}}
                        >{{obj.title}}</option>
                      {{/each}}
                    </select>
                  </EditableField>
                {{else}}
                  <span data-test-course-title>{{if
                      this.course
                      this.course.title
                      (t "general.notApplicableAbbr")
                    }}</span>
                {{/if}}
              </span>
              {{#if this.selectedCourse}}
                {{#if this.selectedCourse.id}}
                  <span class="details" data-test-course-details>
                    {{t "general.level"}}:
                    {{this.selectedCourse.level}},
                    {{t "general.startDate"}}:
                    {{formatDate
                      this.selectedCourse.startDate
                      day="2-digit"
                      month="2-digit"
                      year="numeric"
                    }},
                    {{t "general.endDate"}}:
                    {{formatDate
                      this.selectedCourse.endDate
                      day="2-digit"
                      month="2-digit"
                      year="numeric"
                    }}
                    {{#if this.selectedCourse.clerkshipType}}
                      -
                      {{t "general.clerkship"}}
                      ({{this.selectedCourse.clerkshipType.title}})
                    {{/if}}
                  </span>
                {{/if}}
              {{else if this.course}}
                <span class="details" data-test-course-details>
                  {{t "general.level"}}:
                  {{this.course.level}},
                  {{t "general.startDate"}}:
                  {{formatDate this.course.startDate day="2-digit" month="2-digit" year="numeric"}},
                  {{t "general.endDate"}}:
                  {{formatDate this.course.endDate day="2-digit" month="2-digit" year="numeric"}}
                  {{#if this.course.clerkshipType}}
                    -
                    {{t "general.clerkship"}}
                    ({{this.course.clerkshipType.title}})
                  {{/if}}
                </span>
              {{/if}}
            </div>
            <div class="block description" data-test-description>
              <label for="description-{{templateId}}">{{t "general.description"}}:</label>
              {{#if @canUpdate}}
                <EditableField
                  @value={{if
                    this.description
                    this.description
                    (t "general.clickToAddDescription")
                  }}
                  @save={{perform this.saveDescription}}
                  @close={{this.revertDescriptionChanges}}
                  @closeOnEscape={{true}}
                  as |isSaving|
                >
                  <textarea
                    id="description-{{templateId}}"
                    value={{this.description}}
                    oninput={{this.changeDescription}}
                    disabled={{isSaving}}
                  >
                    {{this.description}}
                  </textarea>
                </EditableField>
              {{else}}
                <span>{{@sequenceBlock.description}}</span>
              {{/if}}
            </div>
            <div class="block required" data-test-required>
              <label for="required-{{templateId}}">{{t "general.required"}}:</label>
              {{#if @canUpdate}}
                <EditableField
                  @value={{this.requiredLabel}}
                  @save={{perform this.changeRequired}}
                  @close={{this.revertRequiredChanges}}
                >
                  <select
                    id="required-{{templateId}}"
                    {{on "change" (pick "target.value" this.setRequired)}}
                  >
                    <option value="1" selected={{eq this.required "1"}}>{{t
                        "general.required"
                      }}</option>
                    <option value="2" selected={{eq this.required "2"}}>{{t
                        "general.optionalElective"
                      }}</option>
                    <option value="3" selected={{eq this.required "3"}}>{{t
                        "general.requiredInTrack"
                      }}</option>
                  </select>
                </EditableField>
              {{else}}
                <span>{{this.requiredLabel}}</span>
              {{/if}}
            </div>
            <div class="block track" data-test-track>
              <label>{{t "general.isTrack"}}:</label>
              {{#if @canUpdate}}
                <ToggleYesno @yes={{@sequenceBlock.track}} @toggle={{perform this.changeTrack}} />
              {{else}}
                <span>{{if @sequenceBlock.track (t "general.yes") (t "general.no")}}</span>
              {{/if}}
            </div>
            {{#if this.isEditingDatesAndDuration}}
              <section
                class="curriculum-inventory-sequence-block-dates-duration-editor"
                data-test-curriculum-inventory-sequence-block-dates-duration-editor
              >
                <div class="item start-date" data-test-startdate>
                  <label for="startdate-{{templateId}}">
                    {{t "general.start"}}:
                  </label>
                  <DatePicker
                    id="startdate-{{templateId}}"
                    @value={{this.startDate}}
                    @onChange={{this.changeStartDate}}
                    {{this.validations.attach "startDate"}}
                  />
                  <YupValidationMessage
                    @description={{t "general.startDate"}}
                    @validationErrors={{this.validations.errors.startDate}}
                    data-test-start-date-validation-error-message
                  />
                </div>
                <div class="item end-date" data-test-enddate>
                  <label for="enddate-{{templateId}}">
                    {{t "general.end"}}:
                  </label>
                  <DatePicker
                    id="enddate-{{templateId}}"
                    @value={{this.endDate}}
                    @onChange={{this.changeEndDate}}
                    {{this.validations.attach "endDate"}}
                  />
                  <YupValidationMessage
                    @description={{t "general.endDate"}}
                    @validationErrors={{this.validations.errors.endDate}}
                    data-test-end-date-validation-error-message
                  />
                </div>
                <div class="item duration" data-test-duration>
                  <label for="duration-{{templateId}}">
                    {{t "general.durationInDays"}}:
                  </label>
                  <input
                    id="duration-{{templateId}}"
                    type="text"
                    value={{this.duration}}
                    disabled={{this.saveDuration.isRunning}}
                    {{on "input" (pick "target.value" (set this "duration"))}}
                    {{on "keyup" this.saveOrCancelDuration}}
                    {{this.validations.attach "duration"}}
                  />
                  <YupValidationMessage
                    @description={{t "general.duration"}}
                    @validationErrors={{this.validations.errors.duration}}
                    data-test-duration-validation-error-message
                  />
                </div>
                <div class="buttons">
                  <button
                    type="button"
                    class="done text"
                    disabled={{this.saveDuration.isRunning}}
                    data-test-save
                    {{on "click" (perform this.saveDuration)}}
                  >
                    {{#if this.saveDuration.isRunning}}
                      <LoadingSpinner />
                    {{else}}
                      {{t "general.done"}}
                    {{/if}}
                  </button>
                  <button
                    type="button"
                    class="cancel text"
                    disabled={{this.saveDuration.isRunning}}
                    data-test-cancel
                    {{on "click" this.cancelDurationEditing}}
                  >
                    {{t "general.cancel"}}
                  </button>
                </div>
              </section>
            {{else}}
              <div class="block start-date" data-test-start-date>
                <label>{{t "general.start"}}:</label>
                {{#if @canUpdate}}
                  <button
                    class="link-button"
                    type="button"
                    data-test-edit
                    {{on "click" (set this "isEditingDatesAndDuration" true)}}
                  >
                    {{#if @sequenceBlock.startDate}}
                      {{formatDate
                        @sequenceBlock.startDate
                        day="2-digit"
                        month="2-digit"
                        year="numeric"
                      }}
                    {{else}}
                      {{t "general.clickToEdit"}}
                    {{/if}}
                  </button>
                {{else}}
                  <span>
                    {{#if @sequenceBlock.startDate}}
                      {{formatDate
                        @sequenceBlock.startDate
                        day="2-digit"
                        month="2-digit"
                        year="numeric"
                      }}
                    {{else}}
                      {{t "general.notApplicableAbbr"}}
                    {{/if}}
                  </span>
                {{/if}}
              </div>
              <div class="block end-date" data-test-end-date>
                <label>{{t "general.end"}}:</label>
                {{#if @canUpdate}}
                  <button
                    class="link-button"
                    type="button"
                    data-test-edit
                    {{on "click" (set this "isEditingDatesAndDuration" true)}}
                  >
                    {{#if @sequenceBlock.endDate}}
                      {{formatDate
                        @sequenceBlock.endDate
                        day="2-digit"
                        month="2-digit"
                        year="numeric"
                      }}
                    {{else}}
                      {{t "general.clickToEdit"}}
                    {{/if}}
                  </button>
                {{else}}
                  <span>
                    {{#if @sequenceBlock.endDate}}
                      {{formatDate
                        @sequenceBlock.endDate
                        day="2-digit"
                        month="2-digit"
                        year="numeric"
                      }}
                    {{else}}
                      {{t "general.notApplicableAbbr"}}
                    {{/if}}
                  </span>
                {{/if}}
              </div>
              <div class="block duration" data-test-duration>
                <label>{{t "general.durationInDays"}}:</label>
                {{#if @canUpdate}}
                  <button
                    class="link-button"
                    type="button"
                    data-test-edit
                    {{on "click" (set this "isEditingDatesAndDuration" true)}}
                  >
                    {{#if @sequenceBlock.duration}}
                      {{@sequenceBlock.duration}}
                    {{else}}
                      {{t "general.clickToEdit"}}
                    {{/if}}
                  </button>
                {{else}}
                  <span>
                    {{#if @sequenceBlock.duration}}
                      {{@sequenceBlock.duration}}
                    {{else}}
                      {{t "general.notApplicableAbbr"}}
                    {{/if}}
                  </span>
                {{/if}}
              </div>
            {{/if}}
            <div class="block child-sequence-order" data-test-child-sequence-order>
              <label for="child-sequence-order-{{templateId}}">{{t
                  "general.childSequenceOrder"
                }}:</label>
              {{#if @canUpdate}}
                <EditableField
                  @value={{this.childSequenceOrderLabel}}
                  @save={{perform this.changeChildSequenceOrder}}
                  @close={{this.revertChildSequenceOrderChanges}}
                >
                  <select
                    id="child-sequence-order-{{templateId}}"
                    {{on "change" (pick "target.value" (set this "childSequenceOrder"))}}
                  >
                    <option value="1" selected={{eq this.childSequenceOrder "1"}}>{{t
                        "general.ordered"
                      }}</option>
                    <option value="2" selected={{eq this.childSequenceOrder "2"}}>{{t
                        "general.unordered"
                      }}</option>
                    <option value="3" selected={{eq this.childSequenceOrder "3"}}>{{t
                        "general.parallel"
                      }}</option>
                  </select>
                </EditableField>
              {{else}}
                <span>{{this.childSequenceOrderLabel}}</span>
              {{/if}}
            </div>
            <div class="block order-in-sequence" data-test-order-in-sequence>
              <label for="order-in-sequence-{{templateId}}">{{t "general.orderInSequence"}}:</label>
              <span>
                {{#if this.isInOrderedSequence}}
                  {{#if @canUpdate}}
                    <EditableField
                      @value={{@sequenceBlock.orderInSequence}}
                      @save={{perform this.saveOrderInSequenceChanges}}
                      @close={{this.revertOrderInSequenceChanges}}
                    >
                      <select
                        id="order-in-sequence-{{templateId}}"
                        {{on "change" this.updateOrderInSequence}}
                      >
                        {{#each this.orderInSequenceOptions as |val|}}
                          <option
                            value={{val}}
                            selected={{eq val this.orderInSequence}}
                          >{{val}}</option>
                        {{/each}}
                      </select>
                    </EditableField>
                  {{else}}
                    {{@sequenceBlock.orderInSequence}}
                  {{/if}}
                {{else}}
                  {{t "general.notApplicableAbbr"}}
                {{/if}}
              </span>
            </div>
            <div class="block starting-academic-level" data-test-starting-academic-level>
              <label for="starting-academic-level-{{templateId}}">{{t
                  "general.startLevel"
                }}:</label>
              {{#if @canUpdate}}
                <EditableField
                  @value={{@sequenceBlock.startingAcademicLevel.name}}
                  @save={{perform this.changeStartLevel}}
                  @close={{this.revertStartLevelChanges}}
                >
                  <select
                    id="starting-academic-level-{{templateId}}"
                    {{on "change" this.setStartLevel}}
                    {{this.validations.attach "startLevel"}}
                  >
                    {{#each (sortBy "level" this.academicLevels) as |obj|}}
                      <option
                        value={{obj.id}}
                        selected={{eq obj.id @sequenceBlock.startingAcademicLevel.id}}
                      >{{obj.name}}</option>
                    {{/each}}
                  </select>
                  <YupValidationMessage
                    @description={{t "general.startLevel"}}
                    @validationErrors={{this.validations.errors.startLevel}}
                    data-test-start-level-validation-error-message
                  />
                </EditableField>
              {{else}}
                <span>{{@sequenceBlock.startingAcademicLevel.name}}</span>
              {{/if}}
            </div>
            <div class="block ending-academic-level" data-test-ending-academic-level>
              <label for="ending-academic-level-{{templateId}}">{{t "general.endLevel"}}:</label>
              {{#if @canUpdate}}
                <EditableField
                  @value={{@sequenceBlock.endingAcademicLevel.name}}
                  @save={{perform this.changeEndLevel}}
                  @close={{this.revertEndLevelChanges}}
                >
                  <select
                    id="ending-academic-level-{{templateId}}"
                    {{on "change" this.setEndLevel}}
                    {{this.validations.attach "endLevel"}}
                  >
                    {{#each (sortBy "level" this.academicLevels) as |obj|}}
                      <option
                        value={{obj.id}}
                        selected={{eq obj.id @sequenceBlock.endingAcademicLevel.id}}
                      >{{obj.name}}</option>
                    {{/each}}
                  </select>
                  <YupValidationMessage
                    @description={{t "general.endLevel"}}
                    @validationErrors={{this.validations.errors.endLevel}}
                    data-test-end-level-validation-error-message
                  />
                </EditableField>
              {{else}}
                <span>{{@sequenceBlock.endingAcademicLevel.name}}</span>
              {{/if}}
            </div>
            <div
              class="block is-selective {{unless this.isSelective 'hidden'}}"
              data-test-is-selective
            >
              <label>{{t "general.sequenceBlockIsSelective"}}</label>
            </div>
            {{#if this.isEditingMinMax}}
              <section
                class="curriculum-inventory-sequence-block-min-max-editor"
                data-test-curriculum-inventory-sequence-block-min-max-editor
              >
                <div class="item minimum" data-test-minimum>
                  <label for="minimum-{{templateId}}">
                    {{t "general.minimum"}}:
                  </label>
                  <input
                    id="minimum-{{templateId}}"
                    type="text"
                    value={{if this.isElective "0" this.minimum}}
                    disabled={{or this.isElective this.saveMinMax.isRunning}}
                    {{on "input" (pick "target.value" (set this "minimum"))}}
                    {{on "keyup" this.saveOrCancelMinMax}}
                    {{this.validations.attach "minimum"}}
                  />
                  <YupValidationMessage
                    @description={{t "general.minimum"}}
                    @validationErrors={{this.validations.errors.minimum}}
                    data-test-minimum-validation-error-message
                  />
                </div>
                <div class="item maximum" data-test-maximum>
                  <label for="maximum-{{templateId}}">
                    {{t "general.maximum"}}:
                  </label>
                  <input
                    id="maximum-{{templateId}}"
                    type="text"
                    value={{this.maximum}}
                    disabled={{this.saveMinMax.isRunning}}
                    {{on "input" (pick "target.value" (set this "maximum"))}}
                    {{on "keyup" this.saveOrCancelMinMax}}
                    {{this.validations.attach "maximum"}}
                  />
                  <YupValidationMessage
                    @description={{t "general.maximum"}}
                    @validationErrors={{this.validations.errors.maximum}}
                    data-test-maximum-validation-error-message
                  />
                </div>
                <div class="buttons">
                  <button
                    type="button"
                    class="done text"
                    disabled={{this.saveMinMax.isRunning}}
                    data-test-save
                    {{on "click" (perform this.saveMinMax)}}
                  >
                    {{#if this.save.isRunning}}
                      <LoadingSpinner />
                    {{else}}
                      {{t "general.done"}}
                    {{/if}}
                  </button>
                  <button
                    type="button"
                    class="cancel text"
                    data-test-cancel
                    disabled={{this.save.isRunning}}
                    {{on "click" this.cancelMinMaxEditing}}
                  >
                    {{t "general.cancel"}}
                  </button>
                </div>
              </section>
            {{else}}
              <div class="block minimum" data-test-minimum>
                <label>{{t "general.minimum"}}:</label>
                {{#if (and @canUpdate (not this.isElective))}}
                  <button
                    class="link-button"
                    type="button"
                    data-test-edit
                    {{on "click" this.editMinMax}}
                  >
                    {{this.minimum}}
                  </button>
                {{else}}
                  <span>{{this.minimum}}</span>
                {{/if}}
              </div>
              <div class="block maximum" data-test-maximum>
                <label>{{t "general.maximum"}}:</label>
                {{#if @canUpdate}}
                  <button
                    class="link-button"
                    type="button"
                    data-test-edit
                    {{on "click" this.editMinMax}}
                  >
                    {{this.maximum}}
                  </button>
                {{else}}
                  <span>{{this.maximum}}</span>
                {{/if}}
              </div>
            {{/if}}
            {{#unless this.isManagingSessions}}
              <div class="block sessions" data-test-session-list-controls>
                <label>{{t "general.sessions"}} ({{this.sessions.length}})</label>
                {{#if (and (not this.isManagingSessions) @canUpdate this.sessions.length)}}
                  <div class="actions">
                    <button type="button" {{on "click" this.toggleManagingSessions}}>{{t
                        "general.manage"
                      }}</button>
                  </div>
                {{/if}}
              </div>
            {{/unless}}
          </div>
        </div>
        {{#if this.sessions.length}}
          {{#if (and this.isManagingSessions this.dataForSessionsManagerLoaded)}}
            <SequenceBlockSessionManager
              @linkedSessions={{this.linkedSessions}}
              @excludedSessions={{this.excludedSessions}}
              @sessions={{this.sessions}}
              @cancel={{this.cancelManagingSessions}}
              @save={{perform this.changeSessions}}
              @sortBy={{@sortBy}}
              @setSortBy={{@setSortBy}}
            />
          {{else}}
            <SequenceBlockSessionList
              @sequenceBlock={{@sequenceBlock}}
              @sessions={{this.sessions}}
              @sortBy={{@sortBy}}
              @setSortBy={{@setSortBy}}
            />
          {{/if}}
        {{/if}}
      {{/let}}
    </section>
  </template>
}
