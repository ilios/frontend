import Component from '@glimmer/component';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { cached, tracked } from '@glimmer/tracking';
import { findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class AssignStudentsManagerComponent extends Component {
  @service store;
  @service dataLoader;

  @tracked primaryCohortId = null;

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.dataLoader.loadSchoolsForLearnerGroups());
  }

  @cached
  get data() {
    return {
      programs: this.store.peekAll('program'),
      programYears: this.store.peekAll('program-year'),
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
}
