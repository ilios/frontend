import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';

export default class ReportsSubjectNewAcademicYearComponent extends Component {
  @service store;
  @service iliosConfig;

  @cached
  get academicYearsData() {
    return new TrackedAsyncData(this.store.findAll('academic-year'));
  }

  get academicYears() {
    return this.academicYearsData.isResolved ? this.academicYearsData.value : [];
  }

  get bestSelectedAcademicYear() {
    const ids = this.academicYears.map(({ id }) => id);

    if (ids.includes(this.args.currentId)) {
      return this.args.currentId;
    }

    const currentYear = currentAcademicYear();
    const currentYearId = this.academicYears.find(({ id }) => Number(id) === currentYear)?.id;
    const newId = currentYearId ?? ids.at(-1);

    return newId;
  }

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }
}
