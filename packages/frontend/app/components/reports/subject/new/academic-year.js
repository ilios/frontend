import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';

export default class ReportsSubjectNewAcademicYearComponent extends Component {
  @service store;
  @service iliosConfig;

  @cached
  get data() {
    return new TrackedAsyncData(this.store.findAll('academic-year'));
  }

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }

  get academicYears() {
    return this.data.value;
  }

  get isLoaded() {
    return this.data.isResolved;
  }

  setInitialValue = task(async () => {
    await timeout(1); //wait a moment so we can render before setting
    const ids = this.academicYears.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return;
    }
    const currentYear = currentAcademicYear();
    const currentYearId = this.academicYears.find(({ id }) => Number(id) === currentYear)?.id;
    this.args.changeId(currentYearId ?? ids.at(-1));
  });
}
