import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import scrollTo from 'ilios-common/utils/scroll-to';
import { dropTask, restartableTask } from 'ember-concurrency';
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

  load = restartableTask(async () => {
    const currentYear = new Date().getFullYear();
    const program = await this.args.report.program;
    const school = await program.school;
    this.academicYearCrossesCalendarYearBoundaries = await this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
    this.canRollover = await this.permissionChecker.canCreateCurriculumInventoryReport(school);
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
  });

  changeStartDate = dropTask(async () => {
    this.addErrorDisplayFor('startDate');
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('startDate');
    this.args.report.startDate = this.startDate;
    await this.args.report.save();
  });

  @action
  revertStartDateChanges() {
    this.removeErrorDisplayFor('startDate');
    this.startDate = this.args.report.get.startDate;
  }

  changeEndDate = dropTask(async () => {
    this.addErrorDisplayFor('endDate');
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('endDate');
    this.args.report.endDate = this.endDate;
    await this.args.report.save();
  });

  @action
  revertEndDateChanges() {
    this.removeErrorDisplayFor('endDate');
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
    this.addErrorDisplayFor('description');
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('description');
    this.args.report.description = this.description;
    await this.args.report.save();
  });

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
