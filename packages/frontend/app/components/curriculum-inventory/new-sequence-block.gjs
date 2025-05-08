import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { findById } from 'ilios-common/utils/array-helpers';
import YupValidations from 'ilios-common/classes/yup-validations';
import { date, string, mixed, number } from 'yup';
import { DateTime } from 'luxon';

export default class CurriculumInventoryNewSequenceBlock extends Component {
  @service intl;
  @service store;

  @tracked startLevel;
  @tracked endLevel;
  @tracked childSequenceOrder;
  @tracked course;
  @tracked description;
  @tracked duration = 0;
  @tracked startDate;
  @tracked endDate;
  @tracked orderInSequence = null;
  @tracked maximum = 0;
  @tracked minimum = 0;
  @tracked required;
  @tracked title;
  @tracked track = false;
  childSequenceOrderOptions = [
    { id: '1', title: this.intl.t('general.ordered') },
    { id: '2', title: this.intl.t('general.unordered') },
    { id: '3', title: this.intl.t('general.parallel') },
  ];

  requiredOptions = [
    { id: '1', title: this.intl.t('general.required') },
    { id: '2', title: this.intl.t('general.optionalElective') },
    { id: '3', title: this.intl.t('general.requiredInTrack') },
  ];

  constructor() {
    super(...arguments);
    this.childSequenceOrder = this.childSequenceOrderOptions[0];
    this.required = this.requiredOptions[0];
  }

  validations = new YupValidations(this, {
    startDate: date().when('$hasZeroDurationOrLinkedCourseIsClerkship', {
      is: true,
      then: (schema) => schema.required(),
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
        // In case no user selection has been made (yet), we'll use default values for comparison.
        const defaultStartLevel = await this.getDefaultStartLevel(
          this.args.report,
          this.args.parent,
        );
        const defaultEndLevel = await this.getDefaultEndLevel(this.args.report, this.args.parent);
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
        // In case no user selection has been made (yet), we'll use default values for comparison.
        const defaultStartLevel = await this.getDefaultStartLevel(
          this.args.report,
          this.args.parent,
        );
        const defaultEndLevel = await this.getDefaultEndLevel(this.args.report, this.args.parent);
        const startLevel = this.startLevel || defaultStartLevel;
        const endLevel = value || defaultEndLevel;
        return endLevel.level >= startLevel.level;
      },
    ),
    title: string().trim().required().max(200),
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
  get siblingsData() {
    return new TrackedAsyncData(this.args.parent ? this.args.parent.children : []);
  }

  get siblings() {
    return this.siblingsData.isResolved ? this.siblingsData.value : [];
  }

  get defaultOrderInSequence() {
    if (!this.isInOrderedSequence || !this.args.parent) {
      return 0;
    }
    return 1;
  }

  @cached
  get orderInSequenceOptionsData() {
    return new TrackedAsyncData(
      this.getOrderInSequenceOptions(this.isInOrderedSequence, this.siblings),
    );
  }

  get orderInSequenceOptions() {
    return this.orderInSequenceOptionsData.isResolved ? this.orderInSequenceOptionsData.value : [];
  }

  async getOrderInSequenceOptions(isInOrderedSequence, siblings) {
    const rhett = [];
    if (!isInOrderedSequence || !parent) {
      return rhett;
    }
    for (let i = 0, n = siblings.length + 1; i < n; i++) {
      rhett.push(i + 1);
    }
    return rhett;
  }

  @cached
  get linkableCoursesData() {
    // We're only referencing the parent sequence block's course value here
    // so that a re-computation is triggered if/when that value changes.
    return new TrackedAsyncData(
      this.getLinkableCourses(this.args.report, this.args.parent?.course),
    );
  }

  get linkableCourses() {
    return this.linkableCoursesData.isResolved ? this.linkableCoursesData.value : [];
  }

  async getLinkableCourses(report) {
    const program = await report.program;
    const schoolId = program.belongsTo('school').id();
    const linkedCourses = await report.getLinkedCourses();
    const allLinkableCourses = await this.store.query('course', {
      filters: {
        school: [schoolId],
        published: true,
        year: report.year,
      },
    });
    // Filter out all courses that are linked to (sequence blocks in) this report.
    return allLinkableCourses.filter((course) => {
      return !linkedCourses.includes(course);
    });
  }

  @cached
  get academicLevelsData() {
    return new TrackedAsyncData(this.args.report.academicLevels);
  }

  get academicLevels() {
    return this.academicLevelsData.isResolved ? this.academicLevelsData.value : [];
  }

  @cached
  get defaultStartLevelData() {
    return new TrackedAsyncData(this.getDefaultStartLevel(this.args.report, this.args.parent));
  }

  get defaultStartLevel() {
    return this.defaultStartLevelData.isResolved ? this.defaultStartLevelData.value : null;
  }

  async getDefaultStartLevel(report, parent) {
    if (parent) {
      return await parent.startingAcademicLevel;
    }

    const academicLevels = await report.academicLevels;
    return academicLevels[0];
  }

  @cached
  get defaultEndLevelData() {
    return new TrackedAsyncData(this.getDefaultEndLevel(this.args.report, this.args.parent));
  }

  get defaultEndLevel() {
    return this.defaultEndLevelData.isResolved ? this.defaultEndLevelData.value : null;
  }

  async getDefaultEndLevel(report, parent) {
    if (parent) {
      return await parent.endingAcademicLevel;
    }

    const academicLevels = await report.academicLevels;
    return academicLevels[0];
  }

  get linkedCourseIsClerkship() {
    if (!this.course) {
      return false;
    }
    return !!this.course.belongsTo('clerkshipType').id();
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

  get isInOrderedSequence() {
    return this.args.parent && this.args.parent.isOrdered;
  }

  @action
  changeTrack(track) {
    this.track = track;
  }

  @action
  changeStartDate(startDate) {
    this.startDate = startDate;
  }

  @action
  changeEndDate(endDate) {
    this.endDate = endDate;
  }

  @action
  clearDates() {
    this.endDate = null;
    this.startDate = null;
  }

  @action
  setCourse(id) {
    this.course = id ? findById(this.linkableCourses, id) : null;
  }

  @action
  setRequired(id) {
    this.required = findById(this.requiredOptions, id);
  }

  @action
  setStartLevel(id) {
    this.startLevel = findById(this.academicLevels, id);
  }

  @action
  setEndLevel(id) {
    this.endLevel = findById(this.academicLevels, id);
  }

  @action
  setChildSequenceOrder(id) {
    this.childSequenceOrder = findById(this.childSequenceOrderOptions, id);
  }

  @action
  setOrderInSequence(id) {
    this.orderInSequence = Number(id);
  }

  @action
  setDuration(duration) {
    this.duration = duration;
  }

  @action
  async saveOrCancel(event) {
    const keyCode = event.keyCode;

    if (13 === keyCode) {
      await this.save.perform();
      return;
    }

    if (27 === keyCode) {
      this.args.cancel();
    }
  }

  save = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();

    const defaultStartLevel = await this.getDefaultStartLevel(this.args.report, this.args.parent);
    const defaultEndLevel = await this.getDefaultEndLevel(this.args.report, this.args.parent);

    const block = this.store.createRecord('curriculum-inventory-sequence-block', {
      title: this.title,
      description: this.description,
      parent: this.args.parent,
      startingAcademicLevel: this.startLevel || defaultStartLevel,
      endingAcademicLevel: this.endLevel || defaultEndLevel,
      required: this.required.id,
      track: this.track,
      orderInSequence: this.orderInSequence ?? this.defaultOrderInSequence,
      childSequenceOrder: this.childSequenceOrder.id,
      startDate: this.startDate,
      endDate: this.endDate,
      minimum: this.minimum,
      maximum: this.maximum,
      course: this.course,
      duration: this.duration || 0,
      report: this.args.report,
    });
    await this.args.save(block);
  });
}

<section
  class="curriculum-inventory-new-sequence-block"
  data-test-curriculum-inventory-new-sequence-block
  ...attributes
>
  <h2 class="new-sequence-block-title" data-test-title>
    {{t "general.newSequenceBlock"}}
  </h2>
  {{#let (unique-id) as |templateId|}}
    <div class="form">
      <div class="item title" data-test-title>
        <label for="title-{{templateId}}">
          {{t "general.title"}}:
        </label>
        <input
          id="title-{{templateId}}"
          type="text"
          value={{this.title}}
          disabled={{this.save.isRunning}}
          placeholder={{t "general.sequenceBlockTitlePlaceholder"}}
          {{on "keyup" this.saveOrCancel}}
          {{on "input" (pick "target.value" (set this "title"))}}
          {{this.validations.attach "title"}}
        />
        <YupValidationMessage
          @description={{t "general.title"}}
          @validationErrors={{this.validations.errors.title}}
          data-test-title-validation-error-message
        />
      </div>
      <div class="item course" data-test-course>
        <label for="course-{{templateId}}">
          {{t "general.course"}}:
        </label>
        <select
          id="course-{{templateId}}"
          disabled={{this.save.isRunning}}
          {{on "change" (pick "target.value" this.setCourse)}}
        >
          <option value="" selected={{is-empty this.course}}>{{t "general.selectCourse"}}</option>
          {{#each (sort-by "title" this.linkableCourses) as |obj|}}
            <option value={{obj.id}} selected={{eq obj this.course}}>{{obj.title}}</option>
          {{/each}}
        </select>
        {{#if this.course}}
          <span class="details" data-test-course-details>
            {{t "general.level"}}:
            {{this.course.level}},
            {{t "general.startDate"}}:
            {{format-date this.course.startDate day="2-digit" month="2-digit" year="numeric"}},
            {{t "general.endDate"}}:
            {{format-date this.course.endDate day="2-digit" month="2-digit" year="numeric"}}
            {{#if this.course.clerkshipType}}
              -{{t "general.clerkship"}}
              ({{this.course.clerkshipType.title}})
            {{/if}}
          </span>
        {{/if}}
      </div>
      <div class="item description" data-test-description>
        <label for="description-{{templateId}}">
          {{t "general.description"}}:
        </label>
        <textarea
          id="description-{{templateId}}"
          disabled={{this.save.isRunning}}
          placeholder={{t "general.sequenceBlockDescriptionPlaceholder"}}
          {{on "input" (pick "target.value" (set this "description"))}}
        >{{this.description}}</textarea>
      </div>
      <div class="item required" data-test-required>
        <label for="required-{{templateId}}">
          {{t "general.required"}}:
        </label>
        <select
          id="required-{{templateId}}"
          disabled={{this.save.isRunning}}
          {{on "change" (pick "target.value" this.setRequired)}}
        >
          {{#each this.requiredOptions as |obj|}}
            <option value={{obj.id}} selected={{eq obj.id this.required.id}}>{{obj.title}}</option>
          {{/each}}
        </select>
      </div>
      <div class="item track" data-test-track>
        <label for="is-track-{{templateId}}">
          {{t "general.isTrack"}}?
        </label>
        <ToggleYesno
          id="is-track-{{templateId}}"
          @yes={{this.track}}
          @toggle={{this.changeTrack}}
        />
      </div>
      <div class="item start-date" data-test-startdate>
        <label for="start-date-{{templateId}}">
          {{t "general.startDate"}}:
        </label>
        <DatePicker
          id="start-date-{{templateId}}"
          @value={{this.startDate}}
          @onChange={{this.changeStartDate}}
          {{this.validations.attach "startDate"}}
          data-test-start-date-picker
        />
        <YupValidationMessage
          @description={{t "general.startDate"}}
          @validationErrors={{this.validations.errors.startDate}}
          data-test-start-date-validation-error-message
        />
      </div>
      <div class="item end-date" data-test-enddate>
        <label for="end-date-{{templateId}}">
          {{t "general.endDate"}}:
        </label>
        <DatePicker
          id="end-date-{{templateId}}"
          @value={{this.endDate}}
          @onChange={{this.changeEndDate}}
          {{this.validations.attach "endDate"}}
          data-test-end-date-picker
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
          disabled={{this.save.isRunning}}
          {{on "keyup" this.saveOrCancel}}
          {{on "input" (pick "target.value" this.setDuration)}}
          {{this.validations.attach "duration"}}
        />
        <YupValidationMessage
          @description={{t "general.duration"}}
          @validationErrors={{this.validations.errors.duration}}
          data-test-duration-validation-error-message
        />
      </div>
      <div class="item clear-dates">
        <button type="button" {{on "click" this.clearDates}} data-test-clear-dates>
          {{t "general.clearDates"}}
        </button>
      </div>
      <div class="item selective">
        <span>
          {{t "general.isSelective"}}
          ?
        </span>
      </div>
      <div class="item minimum" data-test-minimum>
        <label for="minimum-{{templateId}}">
          {{t "general.minimum"}}:
        </label>
        <input
          id="minimum-{{templateId}}"
          type="text"
          value={{this.minimum}}
          disabled={{this.save.isRunning}}
          {{on "keyup" this.saveOrCancel}}
          {{on "input" (pick "target.value" (set this "minimum"))}}
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
          disabled={{this.save.isRunning}}
          {{on "keyup" this.saveOrCancel}}
          {{on "input" (pick "target.value" (set this "maximum"))}}
          {{this.validations.attach "maximum"}}
        />
        <YupValidationMessage
          @description={{t "general.maximum"}}
          @validationErrors={{this.validations.errors.maximum}}
          data-test-maximum-validation-error-message
        />
      </div>
      <div class="item starting-academic-level" data-test-starting-academic-level>
        <label for="starting-academic-level-{{templateId}}">
          {{t "general.startLevel"}}:
        </label>
        {{#if this.defaultStartLevel}}
          <select
            id="starting-academic-level-{{templateId}}"
            disabled={{this.save.isRunning}}
            {{on "change" (pick "target.value" this.setStartLevel)}}
            {{this.validations.attach "startLevel"}}
          >
            {{#each (sort-by "level" this.academicLevels) as |obj|}}
              <option
                value={{obj.id}}
                selected={{eq obj.id this.defaultStartLevel.id}}
              >{{obj.name}}</option>
            {{/each}}
          </select>
        {{/if}}
        <YupValidationMessage
          @description={{t "general.startLevel"}}
          @validationErrors={{this.validations.errors.startLevel}}
          data-test-start-level-validation-error-message
        />
      </div>
      <div class="item ending-academic-level" data-test-ending-academic-level>
        <label for="ending-academic-level-{{templateId}}">
          {{t "general.endLevel"}}:
        </label>
        {{#if this.defaultEndLevel}}
          <select
            id="ending-academic-level-{{templateId}}"
            disabled={{this.save.isRunning}}
            {{on "change" (pick "target.value" this.setEndLevel)}}
            {{this.validations.attach "endLevel"}}
          >
            {{#each (sort-by "level" this.academicLevels) as |obj|}}
              <option
                value={{obj.id}}
                selected={{eq obj.id this.defaultEndLevel.id}}
              >{{obj.name}}</option>
            {{/each}}
          </select>
        {{/if}}
        <YupValidationMessage
          @description={{t "general.endLevel"}}
          @validationErrors={{this.validations.errors.endLevel}}
          data-test-end-level-validation-error-message
        />
      </div>
      <div class="item child-sequence-order" data-test-child-sequence-order>
        <label for="child-sequence-order-{{templateId}}">
          {{t "general.childSequenceOrder"}}:
        </label>
        <select
          id="child-sequence-order-{{templateId}}"
          disabled={{this.save.isRunning}}
          {{on "change" (pick "target.value" this.setChildSequenceOrder)}}
        >
          {{#each this.childSequenceOrderOptions as |obj|}}
            <option
              value={{obj.id}}
              selected={{eq obj.id this.childSequenceOrder.id}}
            >{{obj.title}}</option>
          {{/each}}
        </select>
      </div>
      {{#if (and @parent @parent.isOrdered)}}
        <div class="item order-in-sequence" data-test-order-in-sequence>
          <label for="order-in-sequence-{{templateId}}">
            {{t "general.orderInSequence"}}:
          </label>
          <select
            id="order-in-sequence-{{templateId}}"
            disabled={{this.save.isRunning}}
            {{on "change" (pick "target.value" this.setOrderInSequence)}}
          >
            {{#each this.orderInSequenceOptions as |val|}}
              <option value={{val}} selected={{eq val this.defaultOrderInSequence}}>{{val}}</option>
            {{/each}}
          </select>
        </div>
      {{/if}}
      <div class="buttons">
        <button
          type="button"
          class="done text"
          disabled={{this.save.isRunning}}
          data-test-save
          {{on "click" (perform this.save)}}
        >
          {{#if this.save.isRunning}}
            <LoadingSpinner />
          {{else}}
            {{t "general.done"}}
          {{/if}}
        </button>
        <button type="button" class="cancel text" data-test-cancel {{on "click" @cancel}}>
          {{t "general.cancel"}}
        </button>
      </div>
    </div>
  {{/let}}
</section>