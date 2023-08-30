import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { hash } from 'rsvp';

export default class ReportsSubjectNewProgramYearComponent extends Component {
  @service store;

  @cached
  get data() {
    return new TrackedAsyncData(
      hash({
        programs: this.store.findAll('program'),
        programYears: this.store.findAll('program-year'),
      })
    );
  }

  get isLoaded() {
    return this.data.isResolved;
  }

  get mappedProgramYears() {
    return this.data.value.programYears.map((programYear) => {
      const programId = programYear.belongsTo('program').id();
      const program = this.data.value.programs.find(({ id }) => id === programId);
      const schoolId = program.belongsTo('school').id();

      return {
        programYear,
        program,
        schoolId,
      };
    });
  }

  get filteredProgramYears() {
    if (this.args.school) {
      return this.mappedProgramYears.filter(({ schoolId }) => schoolId === this.args.school.id);
    }

    return this.mappedProgramYears;
  }

  get sortedProgramYears() {
    return sortBy(this.filteredProgramYears, [
      'programYear.classOfYear',
      'program.title',
    ]).reverse();
  }

  get programYears() {
    return this.sortedProgramYears.map(({ programYear }) => programYear);
  }

  @task
  *setInitialValue() {
    yield timeout(1); //wait a moment so we can render before setting
    const ids = this.programYears.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return;
    }
    if (!this.programYears.length) {
      this.args.changeId(null);
    } else {
      this.args.changeId(this.programYears[0].id);
    }
  }
}
