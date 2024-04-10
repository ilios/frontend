import Component from '@glimmer/component';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';
import { service } from '@ember/service';

const DEBOUNCE_DELAY = 250;

export default class AssignStudentsRootComponent extends Component {
  @service store;

  get hasMoreThanOneSchool() {
    return this.args.model.schools.length > 1;
  }

  get selectedSchool() {
    if (this.args.schoolId) {
      return findById(this.args.model.schools, this.args.schoolId) ?? this.args.model.primarySchool;
    }

    return this.args.model.primarySchool;
  }

  get unassignedStudentsForCurrentSchool() {
    return this.args.model.unassignedStudents.filter((student) => {
      return student.belongsTo('school').id() === this.selectedSchool.id;
    });
  }

  get sortedStudents() {
    return sortBy(this.unassignedStudentsForCurrentSchool, 'fullName');
  }

  get filteredUnassignedStudents() {
    return this.args.query
      ? this.filterStudents(this.sortedStudents, this.args.query)
      : this.sortedStudents;
  }

  setQuery = restartableTask(async (q) => {
    await timeout(DEBOUNCE_DELAY);
    this.args.setQuery(q);
  });

  filterStudents(students, query) {
    return students.filter((student) => {
      const regex = new RegExp(query, 'i');
      return student.fullName.search(regex) > -1;
    });
  }

  @action
  changeSchool(schoolId) {
    this.args.setSchoolId(schoolId);
  }
}
