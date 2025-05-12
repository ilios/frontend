import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';

export default class ReportsSubjectsController extends Controller {
  queryParams = [
    { sortReportsBy: 'sortBy' },
    { titleFilter: 'filter' },
    { title: 'title' },
    { showNewReportForm: 'showNewReportForm' },
    { selectedSchoolId: 'selectedSchoolId' },
    { selectedSubject: 'selectedSubject' },
    { selectedPrepositionalObject: 'selectedPrepositionalObject' },
    { selectedPrepositionalObjectId: 'selectedPrepositionalObjectId' },
    { editReport: 'editReport' },
  ];

  @tracked sortReportsBy = 'title';
  @tracked titleFilter = null;
  @tracked showNewReportForm = false;
  @tracked title = null;
  @tracked selectedSchoolId = null;
  @tracked selectedSubject = null;
  @tracked selectedPrepositionalObject = null;
  @tracked selectedPrepositionalObjectId = null;
  @tracked editReport = false;
  @tracked runningSubjectReport = null;

  changeTitleFilter = restartableTask(async (value) => {
    this.titleFilter = value;
    await timeout(250);
    return value;
  });

  @action
  setRunningSubjectReport(report) {
    this.runningSubjectReport = report;
  }

  @action
  toggleNewReportForm() {
    this.runningSubjectReport = null;
    this.title = null;
    this.selectedSchoolId = null;
    this.selectedSubject = null;
    this.selectedPrepositionalObject = null;
    this.selectedPrepositionalObjectId = null;
    this.showNewReportForm = !this.showNewReportForm;
    this.editReport = false;
  }
}
