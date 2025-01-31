import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';

export default class ReportsController extends Controller {
  queryParams = [
    { sortReportsBy: 'sortBy' },
    { titleFilter: 'filter' },
    { showNewSubjectReportForm: 'showNewSubjectReportForm' },
    { showNewCourseReportForm: 'showNewCourseReportForm' },
    { courses: 'courses' },
  ];

  @tracked sortReportsBy = 'title';
  @tracked titleFilter = null;
  @tracked showNewSubjectReportForm = false;
  @tracked showNewCourseReportForm = false;
  @tracked runningSubjectReport = null;
  @tracked courses = null;

  changeTitleFilter = restartableTask(async (value) => {
    this.titleFilter = value;
    await timeout(250);
    return value;
  });

  @action
  setRunningSubjectReport(report) {
    this.runningSubjectReport = report;
  }

  get selectedCourseIds() {
    return this.courses?.split('-');
  }

  @action
  setSelectedCourseIds(ids) {
    if (!ids || !ids.length) {
      this.courses = null;
    } else {
      //use a Set to remove duplicates
      this.courses = [...new Set(ids)].join('-');
    }
  }
}
