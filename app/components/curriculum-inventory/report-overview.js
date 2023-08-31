import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import scrollTo from 'ilios-common/utils/scroll-to';
import { dropTask, restartableTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import {
  validatable,
  AfterDate,
  BeforeDate,
  Length,
  NotBlank,
} from 'ilios-common/decorators/validation';

@validatable
export default class CurriculumInventoryReportOverviewComponent extends Component {
  @service currentUser;
  @service iliosConfig;
  @service permissionChecker;
  @service router;

  @tracked @NotBlank() @Length(1, 21844) description;
  @BeforeDate('endDate', { granularity: 'minute' }) @tracked startDate;
  @AfterDate('startDate', { granularity: 'minute' }) @tracked endDate;
  @tracked year = null;
  @tracked yearOptions = [];
  @tracked academicYearCrossesCalendarYearBoundaries = false;
  @tracked canRollover = false;

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

  get showRollover() {
    if (this.router.currentRouteName === 'curriculum-inventory-report.rollover') {
      return false;
    }

    return this.canRollover;
  }

  get yearLabel() {
    if (this.academicYearCrossesCalendarYearBoundaries) {
      return this.year + ' - ' + (parseInt(this.year, 10) + 1);
    }
    return this.year;
  }

  @restartableTask
  *load() {
    const currentYear = new Date().getFullYear();
    const program = yield this.args.report.program;
    const school = yield program.school;
    this.academicYearCrossesCalendarYearBoundaries = yield this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries',
    );
    this.canRollover = yield this.permissionChecker.canCreateCurriculumInventoryReport(school);
    const yearOptions = [];
    for (let i = currentYear - 5, n = currentYear + 5; i <= n; i++) {
      yearOptions.push({
        id: `${i}`,
        title: this.academicYearCrossesCalendarYearBoundaries ? `${i} - ${i + 1}` : `${i}`,
      });
    }
    this.yearOptions = yearOptions;
    this.description = this.args.report.description;
    this.year = this.args.report.year;
    this.startDate = this.args.report.startDate;
    this.endDate = this.args.report.endDate;
  }

  @dropTask
  *changeStartDate() {
    this.addErrorDisplayFor('startDate');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('startDate');
    this.args.report.startDate = this.startDate;
    yield this.args.report.save();
  }

  @action
  revertStartDateChanges() {
    this.removeErrorDisplayFor('startDate');
    this.startDate = this.args.report.get.startDate;
  }

  @dropTask
  *changeEndDate() {
    this.addErrorDisplayFor('endDate');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('endDate');
    this.args.report.endDate = this.endDate;
    yield this.args.report.save();
  }

  @action
  revertEndDateChanges() {
    this.removeErrorDisplayFor('endDate');
    this.endDate = this.args.report.endDate;
  }

  @dropTask
  *changeYear() {
    this.args.report.year = this.year;
    yield this.args.report.save();
  }

  @action
  revertYearChanges() {
    this.year = this.args.report.year;
  }

  @dropTask
  *changeDescription() {
    this.addErrorDisplayFor('description');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('description');
    this.args.report.description = this.description;
    yield this.args.report.save();
  }

  @action
  revertDescriptionChanges() {
    this.description = this.args.report.description;
  }

  @action
  transitionToRollover() {
    this.router.transitionTo('curriculum-inventory-report.rollover', this.args.report);
    scrollTo('.rollover-form');
  }
}
