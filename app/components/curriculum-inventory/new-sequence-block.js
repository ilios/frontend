import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency';
import { ValidateIf } from 'class-validator';
import {
  validatable,
  AfterDate,
  Custom,
  IsInt,
  Gte,
  Length,
  Lte,
  NotBlank,
} from 'ilios-common/decorators/validation';

@validatable
export default class CurriculumInventoryNewSequenceBlock extends Component {
  @service intl;
  @service store;

  @tracked academicLevel;
  @tracked academicLevels;
  @tracked childSequenceOrder;
  @tracked childSequenceOrderOptions;
  @tracked course;
  @tracked description;
  @tracked @NotBlank() @IsInt() @Gte(0) @Lte(1200) duration = 0;
  @tracked
  @ValidateIf((o) => o.hasZeroDuration || o.startDate)
  @NotBlank()
  @AfterDate('startDate', { granularity: 'day' })
  endDate;
  @tracked orderInSequence = 0;
  @tracked linkableCourses = [];
  @tracked
  @NotBlank()
  @IsInt()
  @Gte(0)
  @Custom('validateMaximumCallback', 'validateMaximumMessageCallback')
  maximum = 0;
  @tracked @NotBlank() @IsInt() @Gte(0) minimum = 0;
  @tracked orderInSequenceOptions = [];
  @tracked required;
  @tracked requiredOptions;
  @tracked @ValidateIf((o) => o.hasZeroDuration) @NotBlank() startDate;
  @tracked @NotBlank() @Length(1, 200) title;
  @tracked track = false;

  constructor() {
    super(...arguments);
    this.childSequenceOrderOptions = [
      { id: '1', title: this.intl.t('general.ordered') },
      { id: '2', title: this.intl.t('general.unordered') },
      { id: '3', title: this.intl.t('general.parallel') },
    ];
    this.requiredOptions = [
      { id: '1', title: this.intl.t('general.required') },
      { id: '2', title: this.intl.t('general.optionalElective') },
      { id: '3', title: this.intl.t('general.requiredInTrack') },
    ];
  }

  get hasZeroDuration() {
    const num = Number(this.duration);
    if (Number.isNaN(num)) {
      return false;
    }
    return 0 === num;
  }

  get isLoading() {
    return this.load.isRunning || this.reload.isRunning;
  }

  get isInOrderedSequence() {
    return this.args.parent && this.args.parent.isOrdered;
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
    this.course = id ? this.linkableCourses.findBy('id', id) : null;
  }

  @action
  setRequired(id) {
    this.required = this.requiredOptions.findBy('id', id);
  }

  @action
  setAcademicLevel(id) {
    this.academicLevel = this.academicLevels.findBy('id', id);
  }

  @action
  setChildSequenceOrder(id) {
    this.childSequenceOrder = this.childSequenceOrderOptions.findBy('id', id);
  }

  @action
  setOrderInSequence(id) {
    this.orderInSequence = Number(id);
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

  @restartableTask
  *load() {
    this.orderInSequence = 0;
    if (this.isInOrderedSequence) {
      const siblings = yield this.args.parent.children;
      for (let i = 0, n = siblings.toArray().length + 1; i < n; i++) {
        this.orderInSequenceOptions.push(i + 1);
      }
      this.orderInSequence = 1;
    }
    this.childSequenceOrder = this.childSequenceOrderOptions[0];
    this.required = this.requiredOptions[0];
    if (this.args.parent) {
      this.academicLevel = yield this.args.parent.academicLevel;
    }
    if (this.args.report) {
      this.academicLevels = yield this.args.report.academicLevels;
      if (this.args.parent) {
        this.academicLevel = yield this.args.parent.academicLevel;
      } else {
        this.academicLevel = this.academicLevels.firstObject;
      }
      this.linkableCourses = yield this.getLinkableCourses(this.args.report);
    }
  }

  @restartableTask
  *reload() {
    if (this.args.report) {
      this.academicLevels = yield this.args.report.academicLevels;
      if (this.args.parent) {
        this.academicLevel = yield this.args.parent.academicLevel;
      } else {
        this.academicLevel = this.academicLevels.firstObject;
      }
      this.linkableCourses = yield this.getLinkableCourses(this.args.report);
    }
  }

  @dropTask
  *save() {
    this.addErrorDisplaysFor(['title', 'duration', 'startDate', 'endDate', 'minimum', 'maximum']);
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    const block = this.store.createRecord('curriculumInventorySequenceBlock', {
      title: this.title,
      description: this.description,
      parent: this.args.parent,
      academicLevel: this.academicLevel,
      required: this.required.id,
      track: this.track,
      orderInSequence: this.orderInSequence,
      childSequenceOrder: this.childSequenceOrder.id,
      startDate: this.startDate,
      endDate: this.endDate,
      minimum: this.minimum,
      maximum: this.maximum,
      course: this.course,
      duration: this.duration || 0,
      report: this.args.report,
    });
    yield this.args.save(block);
  }
}
