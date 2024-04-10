import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { all } from 'rsvp';
import { DateTime } from 'luxon';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { findById, mapBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class AssignStudentsComponent extends Component {
  @service flashMessages;
  @service store;
  @service dataLoader;

  @tracked primaryCohortId = null;
  @tracked savedUserIds = [];
  @tracked selectedUserIds = [];

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.dataLoader.loadSchoolsForLearnerGroups());
  }

  @cached
  get data() {
    return {
      programs: this.store.peekAll('program'),
      programYears: this.store.peekAll('programYear'),
      cohorts: this.store.peekAll('cohort'),
    };
  }

  @cached
  get programs() {
    return this.data.programs.filter(
      (program) => program.belongsTo('school').id() === this.args.school.id,
    );
  }

  @cached
  get programYears() {
    const programIds = this.programs.map(({ id }) => id);

    return this.data.programYears.filter((programYear) =>
      programIds.includes(programYear.belongsTo('program').id()),
    );
  }

  @cached
  get schoolCohorts() {
    const programYearIds = this.programYears.map(({ id }) => id);

    return this.data.cohorts.filter((cohort) =>
      programYearIds.includes(cohort.belongsTo('programYear').id()),
    );
  }

  get cohorts() {
    const cohortsWithData = this.schoolCohorts.map((cohort) => {
      const programYear = findById(this.programYears, cohort.belongsTo('programYear').id());
      const program = findById(this.programs, programYear.belongsTo('program').id());
      return {
        id: cohort.id,
        model: cohort,
        title: program.title + ' ' + cohort.title,
        startYear: Number(programYear.startYear),
        duration: Number(program.duration),
      };
    });

    const lastYear = DateTime.now().minus({ year: 1 }).year;
    return cohortsWithData.filter((obj) => {
      const finalYear = obj.startYear + obj.duration;
      return finalYear > lastYear;
    });
  }

  get bestSelectedCohort() {
    if (!this.schoolData.isResolved) {
      return false;
    }

    if (this.primaryCohortId) {
      const currentCohort = findById(this.cohorts, this.primaryCohortId);
      return currentCohort ?? false;
    } else {
      return this.cohorts.reverse()[0];
    }
  }

  get filteredStudents() {
    return this.args.students
      ? this.args.students.filter((user) => !this.savedUserIds.includes(user.id))
      : [];
  }

  get totalUnassignedStudents() {
    return this.args.students.length - this.savedUserIds.length;
  }

  @action
  toggleCheck() {
    const currentlySelected = this.selectedUserIds.length;
    const totalDisplayed = this.filteredStudents.length;
    this.selectedUserIds =
      currentlySelected < totalDisplayed ? mapBy(this.filteredStudents, 'id') : [];
  }

  @action
  toggleUserSelection(userId) {
    if (this.selectedUserIds.includes(userId)) {
      this.selectedUserIds = this.selectedUserIds.filter((id) => id !== userId);
    } else {
      this.selectedUserIds = [...this.selectedUserIds, userId];
    }
  }

  save = dropTask(async () => {
    this.savedUserIds = [];
    const ids = this.selectedUserIds;
    const cohort = this.bestSelectedCohort;
    const students = this.args.students;
    const studentsToModify = students.filter((user) => {
      return ids.includes(user.get('id'));
    });
    if (!cohort || studentsToModify.length < 1) {
      return;
    }
    studentsToModify.setEach('primaryCohort', cohort.model);

    while (studentsToModify.get('length') > 0) {
      const parts = studentsToModify.splice(0, 3);
      await all(parts.map((part) => part.save()));
      this.savedUserIds = [...this.savedUserIds, ...mapBy(parts, 'id')];
    }
    this.selectedUserIds = [];

    this.flashMessages.success('general.savedSuccessfully');
  });
}
