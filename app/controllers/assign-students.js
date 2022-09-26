import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';

const DEBOUNCE_DELAY = 250;

export default class AssignStudentsController extends Controller {
  @service store;

  queryParams = ['query', 'schoolId'];

  @tracked query = '';
  @tracked schoolId = null;

  get hasMoreThanOneSchool() {
    return this.model.schools.length > 1;
  }

  get selectedSchool() {
    if (this.schoolId) {
      return findById(this.model.schools.slice(), this.schoolId) ?? this.model.primarySchool;
    }

    return this.model.primarySchool;
  }

  get unassignedStudentsForCurrentSchool() {
    return this.model.unassignedStudents.filter((student) => {
      return student.belongsTo('school').id() === this.selectedSchool.id;
    });
  }

  get sortedStudents() {
    return sortBy(this.unassignedStudentsForCurrentSchool, 'fullName');
  }

  get filteredUnassignedStudents() {
    return this.query ? this.filterStudents(this.sortedStudents, this.query) : this.sortedStudents;
  }

  setQuery = restartableTask(async (q) => {
    await timeout(DEBOUNCE_DELAY);
    this.query = q;
  });

  filterStudents(students, query) {
    return students.filter((student) => {
      const regex = new RegExp(query, 'i');
      return student.fullName.search(regex) > -1;
    });
  }
}
