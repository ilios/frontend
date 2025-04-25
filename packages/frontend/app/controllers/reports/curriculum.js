import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ReportsCurriculumController extends Controller {
  queryParams = [{ courses: 'courses' }, { report: 'report' }, { run: 'run' }];

  @tracked courses = null;
  @tracked report = null;
  @tracked run = false;

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
}
