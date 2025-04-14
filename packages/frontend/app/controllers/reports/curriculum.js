import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ReportsCurriculumController extends Controller {
  queryParams = [
    { schools: 'schools' },
    { courses: 'courses' },
    { report: 'report' },
    { run: 'run' },
  ];

  @tracked schools = null;
  @tracked courses = null;
  @tracked report = null;
  @tracked run = false;

  get selectedSchoolIds() {
    return this.schools?.split('-') ?? [];
  }

  setSelectedSchoolIds = (ids) => {
    if (!ids || !ids.length) {
      this.schools = null;
    } else {
      //use a Set to remove duplicates
      this.schools = [...new Set(ids)].join('-');
    }
  };

  get hasMultipleSchools() {
    return this.selectedSchoolIds ? this.selectedSchoolIds.length > 1 : false;
  }

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
