import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import NewSubject from 'frontend/components/reports/new-subject';
import perform from 'ember-concurrency/helpers/perform';
import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import SubjectResults from 'frontend/components/reports/subject-results';
import set from 'ember-set-helper/helpers/set';
import and from 'ember-truth-helpers/helpers/and';
import Table from 'frontend/components/reports/table';
import ListLoading from 'frontend/components/reports/list-loading';

export default class ReportsSubjectsListComponent extends Component {
  @service store;
  @service currentUser;
  @service reporting;

  @tracked newSubjectReport;
  @tracked reportYear;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get allSchools() {
    return new TrackedAsyncData(this.store.findAll('school'));
  }

  get schoolsById() {
    if (!this.allSchools.isResolved) {
      return null;
    }

    const rhett = {};
    this.allSchools.value.forEach((school) => {
      rhett[school.id] = school;
    });

    return rhett;
  }

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @cached
  get subjectReports() {
    return new TrackedAsyncData(this.userModel.isResolved ? this.user.reports : null);
  }

  @cached
  get subjectReportObjects() {
    if (
      !this.subjectReports.isResolved ||
      !this.subjectReports.value ||
      !this.allSchools.isResolved
    ) {
      return null;
    }
    return new TrackedAsyncData(
      Promise.all(
        this.subjectReports.value.map(async (report) => {
          let school;
          if (report.school) {
            const schoolId = report.belongsTo('school').id();

            school = this.schoolsById[schoolId];
          }

          const title = report.title
            ? report.title
            : await this.reporting.buildReportTitle(
                report.subject,
                report.prepositionalObject,
                report.prepositionalObjectTableRowId,
                school,
              );

          return {
            report,
            title,
            type: 'subject',
          };
        }),
      ),
    );
  }

  get reportsCount() {
    return this.user?.hasMany('reports').ids().length ?? 0;
  }

  get decoratedReports() {
    return this.subjectReportObjects?.isResolved ? this.subjectReportObjects.value : [];
  }

  get newReport() {
    if (this.newSubjectReport) {
      return this.decoratedReports.find(({ report }) => report === this.newSubjectReport);
    }

    return false;
  }

  get filteredReports() {
    const filterTitle = this.args.titleFilter?.trim().toLowerCase() ?? '';
    return this.decoratedReports.filter(({ title }) =>
      title.trim().toLowerCase().includes(filterTitle),
    );
  }

  saveNewSubjectReport = task({ drop: true }, async (report) => {
    this.args.setRunningSubjectReport(null);
    this.newSubjectReport = await report.save();
    this.showNewReportForm = false;
  });

  removeReport = task({ drop: true }, async (report) => {
    await report.destroyRecord();
    this.newSubjectReport = null;
  });

  runSubjectReport = task(
    { restartable: true },
    async (subject, prepositionalObject, prepositionalObjectTableRowId, school) => {
      this.reportYear = null;
      this.args.setRunningSubjectReport({
        subject,
        prepositionalObject,
        prepositionalObjectTableRowId,
        school,
        description: await this.reporting.buildReportDescription(
          subject,
          prepositionalObject,
          prepositionalObjectTableRowId,
          school,
        ),
      });
    },
  );

  @action
  createNewReport(type) {
    this.args.setRunningSubjectReport(null);
    this.args[`setShowNew${type}ReportForm`](true);
  }
  <template>
    <div class="reports-subjects-list main-section" data-test-reports-subjects-list>
      <div class="filters">
        <div class="title-filter">
          <input
            value={{@titleFilter}}
            {{on "input" (pick "target.value" @changeTitleFilter)}}
            aria-label={{t "general.filterByTitle"}}
            placeholder={{t "general.filterByTitle"}}
            data-test-title-filter
          />
        </div>
      </div>
      <section class="reports">
        <div class="header">
          <h2 class="title text-align-bottom" data-test-courses-header-title>
            {{t "general.reports"}}
            ({{this.filteredReports.length}})
          </h2>
          <div class="actions">
            <ExpandCollapseButton
              @value={{@showNewReportForm}}
              @action={{@toggleNewReportForm}}
              @expandButtonLabel={{t "general.newReport"}}
              @collapseButtonLabel={{t "general.close"}}
            />
          </div>
        </div>
        <section class="new">
          {{#if @showNewReportForm}}
            <NewSubject
              @save={{perform this.saveNewSubjectReport}}
              @close={{@toggleNewReportForm}}
              @run={{perform this.runSubjectReport}}
              @title={{@title}}
              @setTitle={{@setTitle}}
              @selectedSchoolId={{@selectedSchoolId}}
              @setSelectedSchoolId={{@setSelectedSchoolId}}
              @selectedSubject={{@selectedSubject}}
              @setSelectedSubject={{@setSelectedSubject}}
              @selectedPrepositionalObject={{@selectedPrepositionalObject}}
              @setSelectedPrepositionalObject={{@setSelectedPrepositionalObject}}
              @selectedPrepositionalObjectId={{@selectedPrepositionalObjectId}}
              @setSelectedPrepositionalObjectId={{@setSelectedPrepositionalObjectId}}
            />
          {{/if}}
          {{#if this.newReport}}
            <div class="saved-result" data-test-newly-saved-report>
              <LinkTo
                @route="reports.subject"
                @model={{this.newReport.report}}
                @query={{hash reportYear=null}}
                data-test-report-title
              >
                <FaIcon @icon="square-up-right" />
                {{this.newReport.title}}
              </LinkTo>
              {{t "general.savedSuccessfully"}}
            </div>
          {{/if}}
        </section>
        {{#if @runningSubjectReport}}
          <SubjectResults
            @subject={{@runningSubjectReport.subject}}
            @prepositionalObject={{@runningSubjectReport.prepositionalObject}}
            @prepositionalObjectTableRowId={{@runningSubjectReport.prepositionalObjectTableRowId}}
            @school={{@runningSubjectReport.school}}
            @description={{@runningSubjectReport.description}}
            @year={{this.reportYear}}
            @changeYear={{set this "reportYear"}}
          />
        {{else}}
          <div class="list">
            {{#if (and this.subjectReportObjects this.subjectReportObjects.isResolved)}}
              {{#if this.reportsCount}}
                <Table
                  @decoratedReports={{this.filteredReports}}
                  @query={{@titleFilter}}
                  @sortBy={{@sortReportsBy}}
                  @setSortBy={{@setSortReportsBy}}
                  @remove={{perform this.removeReport}}
                />
              {{/if}}
            {{else}}
              <ListLoading @count={{this.reportsCount}} />
            {{/if}}
          </div>
        {{/if}}
      </section>
    </div>
  </template>
}
