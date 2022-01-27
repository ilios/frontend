import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { dropTask, restartableTask } from 'ember-concurrency';
import { all } from 'rsvp';
import { ValidateIf } from 'class-validator';
import {
  validatable,
  AfterDate,
  Custom,
  IsInt,
  Gte,
  Lte,
  NotBlank,
} from 'ilios-common/decorators/validation';

@validatable
export default class CurriculumInventorySequenceBlockOverviewComponent extends Component {
  @service intl;
  @service store;
  @tracked
  @Custom('validateStartingEndingLevelCallback', 'validateStartingLevelMessageCallback')
  startingAcademicLevel;
  @tracked
  @Custom('validateStartingEndingLevelCallback', 'validateEndingLevelMessageCallback')
  endingAcademicLevel;
  @tracked academicLevels;
  @tracked childSequenceOrder;
  @tracked course;
  @tracked description;
  @tracked isEditingDatesAndDuration = false;
  @tracked isEditingMinMax = false;
  @tracked isManagingSessions = false;
  @tracked linkableCourses = [];
  @tracked @NotBlank() @IsInt() @Gte(0) minimum;
  @tracked
  @NotBlank()
  @IsInt()
  @Gte(0)
  @Custom('validateMaximumCallback', 'validateMaximumMessageCallback')
  maximum;
  @tracked isInOrderedSequence;
  @tracked orderInSequence;
  @tracked orderInSequenceOptions = [];
  @tracked parent;
  @tracked report;
  @tracked required;
  @tracked sessions = [];
  @tracked @NotBlank() @IsInt() @Gte(0) @Lte(1200) duration;
  @tracked @ValidateIf((o) => o.hasZeroDuration) @NotBlank() startDate;
  @tracked
  @ValidateIf((o) => o.hasZeroDuration || o.startDate)
  @NotBlank()
  @AfterDate('startDate', { granularity: 'day' })
  endDate;

  get hasZeroDuration() {
    const num = Number(this.duration);
    if (Number.isNaN(num)) {
      return false;
    }
    return 0 === num;
  }

  @restartableTask
  *load(element, [sequenceBlock]) {
    this.report = yield sequenceBlock.report;
    this.parent = yield sequenceBlock.parent;
    this.academicLevels = (yield this.report.academicLevels).toArray();
    this.isInOrderedSequence = false;
    this.orderInSequenceOptions = [];
    if (isPresent(this.parent) && this.parent.isOrdered) {
      this.isInOrderedSequence = true;
      const siblings = yield this.parent.children;
      for (let i = 0, n = siblings.toArray().length; i < n; i++) {
        const num = i + 1;
        this.orderInSequenceOptions.push(num);
      }
    }
    this.linkedSessions = yield sequenceBlock.sessions;
    this.startingAcademicLevel = yield sequenceBlock.startingAcademicLevel;
    this.endingAcademicLevel = yield sequenceBlock.endingAcademicLevel;
    this.required = sequenceBlock.required.toString();
    this.duration = sequenceBlock.duration;
    this.startDate = sequenceBlock.startDate;
    this.endDate = sequenceBlock.endDate;
    this.childSequenceOrder = sequenceBlock.childSequenceOrder.toString();
    this.orderInSequence = sequenceBlock.orderInSequence;
    this.description = sequenceBlock.description;
    this.course = yield sequenceBlock.course;
    this.minimum = sequenceBlock.minimum;
    this.maximum = sequenceBlock.maximum;
    this.sessions = yield this.getSessions(this.course);
    this.linkableCourses = yield this.getLinkableCourses(this.report, this.course);
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
      linkableCourses.pushObject(course);
    }

    return linkableCourses;
  }

  /**
   * Returns a list of published sessions that belong to a given course.
   */
  async getSessions(course) {
    if (!course) {
      return [];
    }
    const sessions = await this.store.query('session', {
      filters: {
        course: course.get('id'),
        published: true,
      },
    });
    return sessions.toArray();
  }

  @dropTask
  *changeRequired() {
    this.args.sequenceBlock.required = parseInt(this.required, 10);
    if ('2' === this.required) {
      this.args.sequenceBlock.minimum = 0;
    }
    yield this.args.sequenceBlock.save();
  }

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

  @dropTask
  *saveCourse() {
    const oldCourse = yield this.args.sequenceBlock.course;
    if (oldCourse !== this.course) {
      this.args.sequenceBlock.set('sessions', []);
      this.args.sequenceBlock.set('excludedSessions', []);
    }
    this.args.sequenceBlock.set('course', this.course);
    yield this.args.sequenceBlock.save();
  }

  @action
  async revertCourseChanges() {
    this.course = await this.args.sequenceBlock.get('course');
  }

  @dropTask()
  *changeTrack(value) {
    this.args.sequenceBlock.set('track', value);
    yield this.args.sequenceBlock.save();
  }

  @dropTask()
  *saveDescription() {
    this.args.sequenceBlock.set('description', this.description);
    yield this.args.sequenceBlock.save();
  }

  @action
  revertDescriptionChanges() {
    this.description = this.args.sequenceBlock.get('description');
  }

  @dropTask
  *changeChildSequenceOrder() {
    this.args.sequenceBlock.set('childSequenceOrder', parseInt(this.childSequenceOrder, 10));
    const savedBlock = yield this.args.sequenceBlock.save();
    const children = yield savedBlock.get('children');
    yield children.invoke('reload');
  }

  @action
  revertChildSequenceOrderChanges() {
    this.childSequenceOrder = this.args.sequenceBlock.get('childSequenceOrder').toString();
  }

  @dropTask
  *changeStartingAcademicLevel() {
    this.addErrorDisplaysFor(['startingAcademicLevel']);
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.args.sequenceBlock.set('startingAcademicLevel', this.startingAcademicLevel);
    yield this.args.sequenceBlock.save();
  }

  @action
  setStartingAcademicLevel(event) {
    const id = event.target.value;
    this.startingAcademicLevel = this.academicLevels.findBy('id', id);
  }

  @action
  revertStartingAcademicLevelChanges() {
    this.startingAcademicLevel = this.args.sequenceBlock.startingAcademicLevel;
  }

  @dropTask
  *changeEndingAcademicLevel() {
    this.addErrorDisplaysFor(['endingAcademicLevel']);
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.args.sequenceBlock.set('endingAcademicLevel', this.endingAcademicLevel);
    yield this.args.sequenceBlock.save();
  }

  @action
  setEndingAcademicLevel(event) {
    const id = event.target.value;
    this.endingAcademicLevel = this.academicLevels.findBy('id', id);
  }

  @action
  revertAcademicLevelChanges() {
    this.endingAcademicLevel = this.args.sequenceBlock.endingAcademicLevel;
  }

  @dropTask
  *changeOrderInSequence() {
    this.args.sequenceBlock.set('orderInSequence', this.orderInSequence);
    const savedBlock = yield this.args.sequenceBlock.save();
    const parent = yield savedBlock.parent;
    const children = yield parent.children;
    yield all(children.invoke('reload'));
  }

  @action
  revertOrderInSequenceChanges() {
    this.orderInSequence = this.args.sequenceBlock.orderInSequence;
  }

  @action
  editMinMax() {
    this.isEditingMinMax = true;
  }

  @action
  cancelMinMaxEditing() {
    this.minimum = this.args.sequenceBlock.minimum;
    this.maximum = this.args.sequenceBlock.maximum;
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

  @dropTask
  *changeSessions(sessions, excludedSessions) {
    this.args.sequenceBlock.set('sessions', sessions);
    this.args.sequenceBlock.set('excludedSessions', excludedSessions);
    yield this.args.sequenceBlock.save();
    this.isManagingSessions = false;
  }

  @action
  updateCourse(event) {
    const value = event.target.value;
    if (!value) {
      this.course = null;
    } else {
      this.course = this.linkableCourses.findBy('id', value);
    }
  }

  @action
  changeDescription(event) {
    this.description = event.target.value;
  }

  @action
  updateOrderInSequence(event) {
    this.orderInSequence = event.target.value;
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
  validateStartingEndingLevelCallback() {
    return this.endingAcademicLevel.level >= this.startingAcademicLevel.level;
  }

  @action
  validateEndingLevelMessageCallback() {
    return this.intl.t('errors.greaterThanOrEqualTo', {
      gte: this.intl.t('general.startLevel'),
      description: this.intl.t('general.endLevel'),
    });
  }

  @action
  validateStartingLevelMessageCallback() {
    return this.intl.t('errors.lessThanOrEqualTo', {
      lte: this.intl.t('general.endLevel'),
      description: this.intl.t('general.startLevel'),
    });
  }

  @dropTask
  *saveMinMax() {
    this.addErrorDisplaysFor(['minimum', 'maximum']);
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.args.sequenceBlock.minimum = this.minimum;
    this.args.sequenceBlock.maximum = this.maximum;

    yield this.args.sequenceBlock.save();
    this.isEditingMinMax = false;
  }

  @action
  changeStartDate(startDate) {
    this.startDate = startDate;
  }

  @action
  changeEndDate(endDate) {
    this.endDate = endDate;
  }

  @dropTask
  *saveDuration() {
    this.addErrorDisplaysFor(['startDate', 'endDate', 'duration']);
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.args.sequenceBlock.startDate = this.startDate;
    this.args.sequenceBlock.endDate = this.endDate;
    this.args.sequenceBlock.duration = this.duration;
    yield this.args.sequenceBlock.save();
    this.isEditingDatesAndDuration = false;
  }

  @action
  cancelDurationEditing() {
    this.startDate = this.args.sequenceBlock.startDate;
    this.endDate = this.args.sequenceBlock.endDate;
    this.duration = this.args.sequenceBlock.duration;
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
}
