import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class CurriculumInventoryReportsComponent extends Component {
  @service currentUser;
  @service intl;
  @service permissionChecker;

  @tracked showNewCurriculumInventoryReportForm = false;
  @tracked hasMoreThanOneSchool = false;
  @tracked selectedSchool = null;
  @tracked sortedSchools = [];
  @tracked programs = [];
  @tracked selectedProgram = null;
  @tracked canCreate = false;

  @cached
  get reportsData() {
    return new TrackedAsyncData(this.selectedProgram?.curriculumInventoryReports);
  }

  get reports() {
    return this.reportsData.isResolved ? this.reportsData.value : null;
  }

  get curriculumInventoryReports() {
    return this.reports ? this.reports.slice() : [];
  }

  @action
  async changeSelectedProgram(programId) {
    const program = findById(this.programs, programId);
    const school = await program.school;
    this.args.setSchoolId(school.id);
    this.args.setProgramId(programId);
    this.showNewCurriculumInventoryReportForm = false;
  }

  @action
  changeSelectedSchool(schoolId) {
    this.args.setSchoolId(schoolId);
    this.args.setProgramId(null);
    this.showNewCurriculumInventoryReportForm = false;
  }

  @action
  toggleNewCurriculumInventoryReportForm() {
    this.showNewCurriculumInventoryReportForm = !this.showNewCurriculumInventoryReportForm;
  }

  @action
  cancel() {
    this.showNewCurriculumInventoryReportForm = false;
  }

  @action
  async saveNewCurriculumInventoryReport(newReport) {
    this.newReport = await newReport.save();
    this.showNewCurriculumInventoryReportForm = false;
  }

  @restartableTask
  *load() {
    if (!this.args.schools) {
      return;
    }
    this.sortedSchools = sortBy(this.args.schools.slice(), 'title');
    this.hasMoreThanOneSchool = this.sortedSchools.length > 1;

    if (!this.args.schoolId) {
      const user = yield this.currentUser.getModel();
      this.selectedSchool = yield user.school;
    } else {
      this.selectedSchool = findById(this.args.schools.slice(), this.args.schoolId);
    }

    if (this.selectedSchool) {
      this.canCreate = yield this.permissionChecker.canCreateCurriculumInventoryReport(
        this.selectedSchool
      );
      const programs = yield this.selectedSchool.programs;
      this.programs = sortBy(programs.slice(), 'title');
    }

    if (this.args.programId) {
      this.selectedProgram = findById(this.programs, this.args.programId);
    } else {
      this.selectedProgram = this.programs.length ? this.programs[0] : null;
    }
  }

  @dropTask
  *removeCurriculumInventoryReport(report) {
    const reports = (yield this.selectedProgram.curriculumInventoryReports).slice();
    reports.splice(reports.indexOf(report), 1);
    this.selectedProgram.set('curriculumInventoryReports', reports);
    yield report.destroyRecord();
  }
}
