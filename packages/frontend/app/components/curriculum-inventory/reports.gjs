import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import eq from 'ember-truth-helpers/helpers/eq';
import and from 'ember-truth-helpers/helpers/and';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import NewReport from 'frontend/components/curriculum-inventory/new-report';
import { LinkTo } from '@ember/routing';
import ReportList from 'frontend/components/curriculum-inventory/report-list';
import perform from 'ember-concurrency/helpers/perform';

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
    return new TrackedAsyncData(this.getSelectedSchool(this.args.schoolId, this.args.schools));
  }

  get selectedSchool() {
    return this.selectedSchoolData.isResolved ? this.selectedSchoolData.value : null;
  }

  async getSelectedSchool(schoolId, schools) {
    if (!schoolId) {
      const user = await this.currentUser.getModel();
      return await user.school;
    } else {
      return findById(schools, schoolId);
    }
  }

  @cached
  get programsData() {
    return new TrackedAsyncData(this.getProgramsInSelectedSchool(this.selectedSchool));
  }

  get programs() {
    return this.programsData.isResolved ? this.programsData.value : [];
  }

  async getProgramsInSelectedSchool(school) {
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
  <template>
    <section class="curriculum-inventory-reports" data-test-curriculum-inventory-reports>
      <div class="filters">
        <div class="schoolsfilter" data-test-schools-filter>
          <FaIcon @icon="building-columns" @fixedWidth={{true}} />
          {{#if this.hasMoreThanOneSchool}}
            <select
              aria-label={{t "general.filterBySchool"}}
              {{on "change" (pick "target.value" this.changeSelectedSchool)}}
            >
              {{#each this.sortedSchools as |school|}}
                <option value={{school.id}} selected={{eq school this.selectedSchool}}>
                  {{school.title}}
                </option>
              {{/each}}
            </select>
          {{else if this.selectedSchool}}
            {{this.selectedSchool.title}}
          {{else}}
            {{t "general.none"}}
          {{/if}}
        </div>
        <div class="programsfilter" data-test-programs-filter>
          <FaIcon @icon="rectangle-list" @fixedWidth={{true}} />
          {{#if this.programs.length}}
            <select
              aria-label={{t "general.filterByProgram"}}
              {{on "change" (pick "target.value" this.changeSelectedProgram)}}
            >
              {{#each this.programs as |program|}}
                <option value={{program.id}} selected={{eq program this.selectedProgram}}>
                  {{program.title}}
                </option>
              {{/each}}
            </select>
          {{else if this.selectedProgram}}
            {{this.selectedProgram.title}}
          {{else}}
            {{t "general.none"}}
          {{/if}}
        </div>
      </div>
      <section class="reports">
        <div class="header">
          <h2 class="title">
            {{t "general.curriculumInventoryReports"}}
          </h2>
          {{#if (and this.canCreate this.selectedProgram)}}
            <div class="actions">
              <ExpandCollapseButton
                @value={{this.showNewCurriculumInventoryReportForm}}
                @action={{this.toggleNewCurriculumInventoryReportForm}}
                @expandButtonLabel={{t "general.newReport"}}
                @collapseButtonLabel={{t "general.close"}}
              />
            </div>
          {{/if}}
        </div>
        <section class="new">
          {{#if this.showNewCurriculumInventoryReportForm}}
            <NewReport
              @currentProgram={{this.selectedProgram}}
              @save={{this.saveNewCurriculumInventoryReport}}
              @cancel={{this.cancel}}
            />
          {{/if}}
          {{#if this.newReport}}
            <div class="saved-result" data-test-saved-results>
              <LinkTo @route="curriculum-inventory-report" @model={{this.newReport}}>
                <FaIcon @icon="square-up-right" />
                {{this.newReport.name}}
              </LinkTo>
              {{t "general.savedSuccessfully"}}
            </div>
          {{/if}}
        </section>
        <div class="list">
          <ReportList
            @reports={{this.curriculumInventoryReports}}
            @sortBy={{@sortReportsBy}}
            @remove={{perform this.removeCurriculumInventoryReport}}
            @setSortBy={{@setSortBy}}
          />
        </div>
      </section>
    </section>
  </template>
}
