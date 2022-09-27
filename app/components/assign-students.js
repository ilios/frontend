import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency';
import { findById, mapBy } from 'ilios-common/utils/array-helpers';

export default class AssignStudentsComponent extends Component {
  @service flashMessages;
  @service store;

  @tracked primaryCohortId = null;
  @tracked savedUserIds = [];
  @tracked selectedUserIds = [];
  @tracked cohorts;

  get bestSelectedCohort() {
    if (!this.cohorts) {
      return false;
    }

    if (this.primaryCohortId) {
      const currentCohort = findById(this.cohorts, this.primaryCohortId);
      return currentCohort ?? false;
    } else {
      return this.cohorts.slice().reverse()[0];
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

  load = restartableTask(async (element, [school]) => {
    let cohorts = await this.store.query('cohort', {
      filters: {
        schools: [school.id],
      },
    });

    //prefetch programYears and programs so that ember data will coalesce these requests.
    const programYears = await all(mapBy(cohorts.slice(), 'programYear'));
    await all(mapBy(programYears.slice(), 'program'));

    cohorts = cohorts.slice();
    const allCohorts = [];

    for (let i = 0; i < cohorts.length; i++) {
      const cohort = cohorts[i];
      const obj = {
        id: cohort.id,
        model: cohort,
      };
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      obj.title = program.title + ' ' + cohort.title;
      obj.startYear = programYear.startYear;
      obj.duration = program.duration;

      allCohorts.push(obj);
    }

    const lastYear = Number(moment().subtract(1, 'year').format('YYYY'));
    this.cohorts = allCohorts.filter((obj) => {
      const finalYear = Number(obj.startYear) + Number(obj.duration);
      return finalYear > lastYear;
    });
  });

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
