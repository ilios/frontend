import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { findById, mapBy, sortBy } from 'ilios-common/utils/array-helpers';
import { service } from '@ember/service';
import { all } from 'rsvp';

const DEBOUNCE_DELAY = 250;

export default class AssignStudentsRootComponent extends Component {
  @service store;
  @service flashMessages;

  @tracked selectedUserIds = [];
  @tracked savedUserIds = [];
  @tracked unassignedStudents = [];

  constructor() {
    super(...arguments);
    // track changes to unassigned students from here on.
    this.unassignedStudents = this.args.model.unassignedStudents;
  }

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
    return this.unassignedStudents.filter((student) => {
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

  save = dropTask(async (cohort) => {
    this.savedUserIds = [];
    const ids = this.selectedUserIds;
    const students = this.filteredUnassignedStudents;
    const studentsToModify = students.filter((user) => {
      return ids.includes(user.id);
    });
    if (!cohort || studentsToModify.length < 1) {
      return;
    }
    studentsToModify.forEach((student) => student.set('primaryCohort', cohort.model));

    while (studentsToModify.length > 0) {
      const parts = studentsToModify.splice(0, 3);
      await all(parts.map((part) => part.save()));
      this.savedUserIds = [...this.savedUserIds, ...mapBy(parts, 'id')];
    }
    this.unassignedStudents = this.unassignedStudents.filter(
      (student) => !this.savedUserIds.includes(student.id),
    );
    this.selectedUserIds = [];

    this.flashMessages.success('general.savedSuccessfully');
  });

  @action
  changeUserSelection(userId) {
    if (this.selectedUserIds.includes(userId)) {
      this.selectedUserIds = this.selectedUserIds.filter((id) => id !== userId);
    } else {
      this.selectedUserIds = [...this.selectedUserIds, userId];
    }
  }

  @action
  changeAllUserSelections() {
    const currentlySelected = this.selectedUserIds.length;
    const currentlyUnassigned = this.filteredUnassignedStudents.length;
    this.selectedUserIds =
      currentlySelected < currentlyUnassigned ? mapBy(this.filteredUnassignedStudents, 'id') : [];
  }
}
