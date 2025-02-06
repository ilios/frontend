import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';

export default class ReportsSubjectNewAcademicYearComponent extends Component {
  @service store;
  @service iliosConfig;

  constructor() {
    super(...arguments);
    console.log('this.args', this.args);
    // this.setInitialValue.perform();
  }

  @cached
  get academicYearsData() {
    return new TrackedAsyncData(this.store.findAll('academic-year'));
  }

  get academicYears() {
    return this.academicYearsData.isResolved ? this.academicYearsData.value : [];
  }

  get bestSelectedAcademicYear() {
    if (this.academicYears.map(({ id }) => id).includes(this.args.currentId)) {
      return this.args.currentId;
    }

    return this.academicYears.find(({ id }) => Number(id) === currentAcademicYear())?.id;
  }

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }

  setInitialValue = task(async () => {
    await timeout(1); //wait a moment so we can render before setting
    const ids = this.academicYears.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return;
    }
    const currentYear = currentAcademicYear();
    const currentYearId = this.academicYears.find(({ id }) => Number(id) === currentYear)?.id;
    const newId = currentYearId ?? ids.at(-1);
    this.args.changeId(newId);
  });
}
