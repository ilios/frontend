import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';

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
    const savedReport = await newReport.save();
    this.newReport = savedReport;
    const program = await this.selectedProgram;
    const reports = (await program.curriculumInventoryReports).slice();
    program.set('curriculumInventoryReports', [...reports, savedReport]);
    this.showNewCurriculumInventoryReportForm = false;
  }

  load = restartableTask(async () => {
    if (!this.args.schools) {
      return;
    }
    this.sortedSchools = sortBy(this.args.schools.slice(), 'title');
    this.hasMoreThanOneSchool = this.sortedSchools.length > 1;

    if (!this.args.schoolId) {
      const user = await this.currentUser.getModel();
      this.selectedSchool = await user.school;
    } else {
      this.selectedSchool = findById(this.args.schools.slice(), this.args.schoolId);
    }

    if (this.selectedSchool) {
      this.canCreate = await this.permissionChecker.canCreateCurriculumInventoryReport(
        this.selectedSchool
      );
      const programs = await this.selectedSchool.programs;
      this.programs = sortBy(programs.slice(), 'title');
    }

    if (this.args.programId) {
      this.selectedProgram = findById(this.programs, this.args.programId);
    } else {
      this.selectedProgram = this.programs.length ? this.programs[0] : null;
    }
  });

  removeCurriculumInventoryReport = dropTask(async (report) => {
    const reports = (await this.selectedProgram.curriculumInventoryReports).slice();
    reports.splice(reports.indexOf(report), 1);
    this.selectedProgram.set('curriculumInventoryReports', reports);
    await report.destroyRecord();
  });
}
