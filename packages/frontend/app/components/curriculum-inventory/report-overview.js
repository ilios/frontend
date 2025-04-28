import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { date, string } from 'yup';
import { DateTime } from 'luxon';

export default class CurriculumInventoryReportOverviewComponent extends Component {
  @service currentUser;
  @service iliosConfig;
  @service permissionChecker;
  @service router;
  @service intl;

  @tracked description;
  @tracked startDate;
  @tracked endDate;
  @tracked year;

  constructor() {
    super(...arguments);
    this.description = this.args.report.description;
    this.year = this.args.report.year;
    this.startDate = this.args.report.startDate;
    this.endDate = this.args.report.endDate;
  }

  validations = new YupValidations(this, {
    description: string().trim().required().max(21844),
    startDate: date()
      .required()
      .test(
        'is-before-end-date',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.before',
            values: {
              before: this.intl.t('general.endDate'),
            },
          };
        },
        (value) => {
          const startDate = DateTime.fromJSDate(value);
          const endDate = DateTime.fromJSDate(this.endDate);
          return startDate.startOf('day') < endDate.startOf('day');
        },
      ),
    endDate: date()
      .required()
      .test(
        'is-after-start-date',
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
          const endDate = DateTime.fromJSDate(value);
          const startDate = DateTime.fromJSDate(this.startDate);
          return startDate.startOf('day') < endDate.startOf('day');
        },
      ),
  });

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.report.getLinkedCourses());
  }

  get linkedCourses() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get linkedCoursesLoaded() {
    return this.courseData.isResolved;
  }

  @cached
  get hasLinkedCourses() {
    return Boolean(this.linkedCourses?.length);
  }

  @cached
  get canRolloverData() {
    return new TrackedAsyncData(this.getCanRollover(this.args.report));
  }

  get canRollover() {
    return this.canRolloverData.isResolved ? this.canRolloverData.value : false;
  }

  async getCanRollover(report) {
    const program = await report.program;
    const school = await program.school;
    return await this.permissionChecker.canCreateCurriculumInventoryReport(school);
  }

  get showRollover() {
    if (this.router.currentRouteName === 'curriculum-inventory-report.rollover') {
      return false;
    }

    return this.canRollover;
  }

  @cached
  get academicYearCrossesCalendarYearBoundariesData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    );
  }

  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearCrossesCalendarYearBoundariesData.isResolved
      ? this.academicYearCrossesCalendarYearBoundariesData.value
      : false;
  }

  get yearOptions() {
    const currentYear = new Date().getFullYear();
    const rhett = [];
    for (let i = currentYear - 5, n = currentYear + 5; i <= n; i++) {
      rhett.push({
        id: `${i}`,
        title: this.academicYearCrossesCalendarYearBoundaries ? `${i} - ${i + 1}` : `${i}`,
      });
    }
    return rhett;
  }

  get yearLabel() {
    if (this.academicYearCrossesCalendarYearBoundaries) {
      return this.year + ' - ' + (parseInt(this.year, 10) + 1);
    }
    return this.year;
  }

  changeStartDate = dropTask(async () => {
    this.validations.addErrorDisplayFor('startDate');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('startDate');
    this.args.report.startDate = this.startDate;
    await this.args.report.save();
  });

  @action
  revertStartDateChanges() {
    this.validations.removeErrorDisplayFor('startDate');
    this.startDate = this.args.report.get.startDate;
  }

  changeEndDate = dropTask(async () => {
    this.validations.addErrorDisplayFor('endDate');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('endDate');
    this.args.report.endDate = this.endDate;
    await this.args.report.save();
  });

  @action
  revertEndDateChanges() {
    this.validations.removeErrorDisplayFor('endDate');
    this.endDate = this.args.report.endDate;
  }

  changeYear = dropTask(async () => {
    this.args.report.year = this.year;
    await this.args.report.save();
  });

  @action
  revertYearChanges() {
    this.year = this.args.report.year;
  }

  changeDescription = dropTask(async () => {
    this.validations.addErrorDisplayFor('description');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('description');
    this.args.report.description = this.description;
    await this.args.report.save();
  });

  @action
  revertDescriptionChanges() {
    this.validations.removeErrorDisplayFor('description');
    this.description = this.args.report.description;
  }

  @action
  transitionToRollover() {
    this.router.transitionTo('curriculum-inventory-report.rollover', this.args.report);
  }
}
