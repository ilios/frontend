import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { ValidateIf } from 'class-validator';
import { TrackedAsyncData } from 'ember-async-data';
import {
  validatable,
  AfterDate,
  Custom,
  IsInt,
  Gte,
  Length,
  NotBlank,
} from 'ilios-common/decorators/validation';
import { findById } from 'ilios-common/utils/array-helpers';
import YupValidations from 'ilios-common/classes/yup-validations';
import { number } from 'yup';

@validatable
export default class CurriculumInventoryNewSequenceBlock extends Component {
  @service intl;
  @service store;

  @tracked
  @Custom('validateStartingEndingLevelCallback', 'validateStartingLevelMessageCallback')
  startingAcademicLevel;
  @tracked
  @Custom('validateStartingEndingLevelCallback', 'validateEndingLevelMessageCallback')
  endingAcademicLevel;
  @tracked childSequenceOrder;
  @tracked course;
  @tracked description;
  @tracked duration = 0;
  @tracked
  @ValidateIf((o) => o.hasZeroDuration || o.linkedCourseIsClerkship)
  @NotBlank()
  startDate;
  @tracked
  @ValidateIf((o) => o.startDate)
  @NotBlank()
  @AfterDate('startDate', { granularity: 'day' })
  endDate;
  @tracked orderInSequence = null;
  @tracked
  @NotBlank()
  @IsInt()
  @Gte(0)
  @Custom('validateMaximumCallback', 'validateMaximumMessageCallback')
  maximum = 0;
  @tracked @NotBlank() @IsInt() @Gte(0) minimum = 0;
  @tracked required;
  @tracked @NotBlank() @Length(1, 200) title;
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
  get defaultStartingAcademicLevelData() {
    return new TrackedAsyncData(
      this.getDefaultStartingAcademicLevel(this.args.report, this.args.parent),
    );
  }

  get defaultStartingAcademicLevel() {
    return this.defaultStartingAcademicLevelData.isResolved
      ? this.defaultStartingAcademicLevelData.value
      : null;
  }

  async getDefaultStartingAcademicLevel(report, parent) {
    if (parent) {
      return await parent.startingAcademicLevel;
    }

    const academicLevels = await report.academicLevels;
    return academicLevels[0];
  }

  @cached
  get defaultEndingAcademicLevelData() {
    return new TrackedAsyncData(
      this.getDefaultEndingAcademicLevel(this.args.report, this.args.parent),
    );
  }

  get defaultEndingAcademicLevel() {
    return this.defaultEndingAcademicLevelData.isResolved
      ? this.defaultEndingAcademicLevelData.value
      : null;
  }

  async getDefaultEndingAcademicLevel(report, parent) {
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
  setStartingAcademicLevel(id) {
    this.startingAcademicLevel = findById(this.academicLevels, id);
  }

  @action
  setEndingAcademicLevel(id) {
    this.endingAcademicLevel = findById(this.academicLevels, id);
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

  @action
  validateMaximumCallback() {
    const max = parseInt(this.maximum, 10) || 0;
    const min = parseInt(this.minimum, 10) || 0;
    return max >= min;
  }

  @action
  validateMaximumMessageCallback() {
    return this.intl.t('errors.greaterThanOrEqualTo', {
      gte: this.intl.t('general.minimum'),
      description: this.intl.t('general.maximum'),
    });
  }

  @action
  async validateStartingEndingLevelCallback() {
    // In case no user selection has been made (yet), we'll use default values for comparison.
    const defaultStartingAcademicLevel = await this.getDefaultStartingAcademicLevel(
      this.args.report,
      this.args.parent,
    );
    const defaultEndingAcademicLevel = await this.getDefaultEndingAcademicLevel(
      this.args.report,
      this.args.parent,
    );
    const startingAcademicLevel = this.startingAcademicLevel || defaultStartingAcademicLevel;
    const endingAcademicLevel = this.endingAcademicLevel || defaultEndingAcademicLevel;
    return endingAcademicLevel.level >= startingAcademicLevel.level;
  }

  @action
  validateStartingLevelMessageCallback() {
    return this.intl.t('errors.lessThanOrEqualTo', {
      lte: this.intl.t('general.endLevel'),
      description: this.intl.t('general.startLevel'),
    });
  }

  @action
  validateEndingLevelMessageCallback() {
    return this.intl.t('errors.greaterThanOrEqualTo', {
      gte: this.intl.t('general.startLevel'),
      description: this.intl.t('general.endLevel'),
    });
  }

  @action
  validateDurationCallback() {
    const duration = parseInt(this.duration, 10);
    return this.linkedCourseIsClerkship ? duration >= 1 : duration >= 0;
  }

  @action
  validateDurationMessageCallback() {
    return this.intl.t('errors.greaterThanOrEqualTo', {
      gte: this.linkedCourseIsClerkship ? 1 : 0,
      description: this.intl.t('general.duration'),
    });
  }

  save = dropTask(async () => {
    this.addErrorDisplaysFor([
      'title',
      'startDate',
      'endDate',
      'minimum',
      'maximum',
      'startingAcademicLevel',
      'endingAcademicLevel',
    ]);
    let isValid = await this.isValid();
    if (!isValid) {
      return false;
    }

    this.validations.addErrorDisplayForAllFields();
    isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();

    const defaultStartingAcademicLevel = await this.getDefaultStartingAcademicLevel(
      this.args.report,
      this.args.parent,
    );
    const defaultEndingAcademicLevel = await this.getDefaultEndingAcademicLevel(
      this.args.report,
      this.args.parent,
    );

    const block = this.store.createRecord('curriculum-inventory-sequence-block', {
      title: this.title,
      description: this.description,
      parent: this.args.parent,
      startingAcademicLevel: this.startingAcademicLevel || defaultStartingAcademicLevel,
      endingAcademicLevel: this.endingAcademicLevel || defaultEndingAcademicLevel,
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
