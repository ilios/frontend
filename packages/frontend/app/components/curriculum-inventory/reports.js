import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class CurriculumInventoryReportsComponent extends Component {
  @service currentUser;
  @service intl;
  @service permissionChecker;
  @tracked showNewCurriculumInventoryReportForm = false;

  get sortedSchools() {
    if (!this.args.schools) {
      return [];
    }
    return sortBy(this.args.schools, 'title');
  }

  get hasMoreThanOneSchool() {
    return this.sortedSchools.length > 1;
  }

  @cached
  get reportsData() {
    return new TrackedAsyncData(this.selectedProgram?.curriculumInventoryReports);
  }

  get reports() {
    return this.reportsData.isResolved ? this.reportsData.value : null;
  }

  get curriculumInventoryReports() {
    return this.reports ?? [];
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

  @cached
  get selectedSchoolData() {
    return new TrackedAsyncData(this.loadSelectedSchool(this.args.schoolId, this.args.schools));
  }

  get selectedSchool() {
    return this.selectedSchoolData.isResolved ? this.selectedSchoolData.value : null;
  }

  async loadSelectedSchool(schoolId, schools) {
    if (!schoolId) {
      const user = await this.currentUser.getModel();
      return await user.school;
    } else {
      return findById(schools, schoolId);
    }
  }

  @cached
  get programsData() {
    return new TrackedAsyncData(this.loadProgramsInSelectedSchool(this.selectedSchool));
  }

  get programs() {
    return this.programsData.isResolved ? this.programsData.value : [];
  }

  async loadProgramsInSelectedSchool(school) {
    if (school) {
      const programs = await school.programs;
      return sortBy(programs, 'title');
    }
    return [];
  }

  get selectedProgram() {
    if (this.args.programId) {
      return findById(this.programs, this.args.programId);
    }

    return this.programs.length ? this.programs[0] : null;
  }

  @cached
  get canCreateData() {
    return new TrackedAsyncData(
      this.permissionChecker.canCreateCurriculumInventoryReport(this.selectedSchool),
    );
  }

  get canCreate() {
    return this.canCreateData.isResolved ? this.canCreateData.value : false;
  }

  removeCurriculumInventoryReport = dropTask(async (report) => {
    const reports = await this.selectedProgram.curriculumInventoryReports;
    reports.splice(reports.indexOf(report), 1);
    this.selectedProgram.set('curriculumInventoryReports', reports);
    await report.destroyRecord();
  });
}
