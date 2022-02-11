import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CurriculumInventoryReportsController extends Controller {
  queryParams = [
    {
      programId: 'program',
      schoolId: 'school',
      sortReportsBy: 'sortBy',
    },
  ];

  @tracked programId = null;
  @tracked schoolId = null;
  @tracked sortReportsBy = 'name';

  @action
  setSortBy(sortBy) {
    this.sortReportsBy = sortBy;
  }

  @action
  setSchoolId(schoolId) {
    this.schoolId = schoolId;
  }

  @action
  setProgramId(programId) {
    this.programId = programId;
  }
}
