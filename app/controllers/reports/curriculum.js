import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import currentAcademicYear from '../../utils/current-academic-year';

export default class ReportsCurriculumController extends Controller {
  queryParams = [{ courses: 'courses' }, { years: 'years' }, { report: 'report' }, { run: 'run' }];

  @tracked courses = null;
  @tracked years = String(currentAcademicYear());
  @tracked report = null;
  @tracked run = false;
  @tracked titleFilter = null;

  get selectedCourseIds() {
    return this.courses?.split('-') ?? [];
  }

  setSelectedCourseIds = (ids) => {
    if (!ids || !ids.length) {
      this.courses = null;
    } else {
      //use a Set to remove duplicates
      this.courses = [...new Set(ids)].join('-');
    }
  };

  get expandedYears() {
    return this.years?.split('-').map((year) => Number(year)) ?? [];
  }

  setExpandedYears = (years) => {
    if (!years || !years.length) {
      this.years = null;
    } else {
      this.years = years.join('-');
    }
  };

  changeTitleFilter = task({ restartable: true }, async (value) => {
    this.titleFilter = value;
  });
}
