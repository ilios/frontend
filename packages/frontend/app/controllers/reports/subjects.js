import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';

export default class ReportsSubjectsController extends Controller {
  queryParams = [
    { sortReportsBy: 'sortBy' },
    { titleFilter: 'filter' },
    { showNewReportForm: 'showNewReportForm' },
    { selectedSchoolId: 'selectedSchoolId' },
    { selectedSubject: 'selectedSubject' },
    { selectedPrepositionalObject: 'selectedPrepositionalObject' },
    { selectedPrepositionalObjectId: 'selectedPrepositionalObjectId' },
  ];

  @tracked sortReportsBy = 'title';
  @tracked titleFilter = null;
  @tracked showNewReportForm = false;
  @tracked selectedSchoolId = null;
  @tracked selectedSubject = null;
  @tracked selectedPrepositionalObject = null;
  @tracked selectedPrepositionalObjectId = null;
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
    this.showNewReportForm = !this.showNewReportForm;
  }
}
