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
      this.schools = ids.join('-');
    }
  };

  get hasMultipleSchools() {
    return this.selectedSchoolIds ? this.countSelectedSchools > 1 : false;
  }

  get countSelectedSchools() {
    return [...new Set(this.selectedSchoolIds)].length;
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
