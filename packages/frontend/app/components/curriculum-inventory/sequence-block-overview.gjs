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
}
