import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { findBy } from 'ilios-common/utils/array-helpers';

export default class NewProgramYearComponent extends Component {
  allYears = [];
  @tracked year;

  get existingStartYears() {
    return this.args.programYears.mapBy('startYear').map(Number);
  }

  get selectedYear() {
    if (!this.year) {
      return this.availableAcademicYears.firstObject;
    }
    return findBy(this.availableAcademicYears, 'value', this.year);
  }

  get availableAcademicYears() {
    return this.allYears
      .filter((year) => !this.existingStartYears.includes(year))
      .map((startYear) => {
        return {
          label: this.args.academicYearCrossesCalendarYearBoundaries
            ? `${startYear} - ${startYear + 1}`
            : startYear.toString(),
          value: startYear.toString(),
        };
      });
  }

  constructor() {
    super(...arguments);
    const firstYear = new Date().getFullYear() - 5;
    for (let i = 0; i < 10; i++) {
      this.allYears.push(firstYear + i);
    }
  }

  @dropTask
  *saveNewYear() {
    yield this.args.save(this.selectedYear.value);
  }
}
