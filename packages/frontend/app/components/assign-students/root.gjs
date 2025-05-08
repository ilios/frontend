import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '@ember/utils';
import { action } from '@ember/object';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { findById, mapBy, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
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
    if (isBlank(this.args.query)) {
      return this.sortedStudents;
    }

    const regex = new RegExp(this.args.query.trim(), 'i');
    return this.sortedStudents.filter((student) => {
      return student.fullName.search(regex) > -1;
    });
  }

  get selectedStudents() {
    return this.sortedStudents.filter((student) => this.selectedUserIds.includes(student.id));
  }

  get selectableAndSelectedStudents() {
    return sortBy(
      uniqueValues([...this.selectedStudents, ...this.filteredUnassignedStudents]),
      'fullName',
    );
  }

  setQuery = restartableTask(async (q) => {
    await timeout(DEBOUNCE_DELAY);
    this.args.setQuery(q);
  });

  save = dropTask(async (cohort) => {
    this.savedUserIds = [];
    const studentsToModify = this.selectedStudents;
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
  changeSchool(schoolId) {
    this.selectedUserIds = [];
    this.args.setSchoolId(schoolId);
  }

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
    this.selectedUserIds =
      this.selectedUserIds.length < this.selectableAndSelectedStudents.length
        ? mapBy(this.selectableAndSelectedStudents, 'id')
        : [];
  }
}
