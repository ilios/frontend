import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ReportsCurriculumController extends Controller {
  queryParams = [{ courses: 'courses' }, { report: 'report' }];

  @tracked courses = null;

  get selectedCourseIds() {
    return this.courses?.split('-');
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
