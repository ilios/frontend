import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { findBy, mapBy } from 'ilios-common/utils/array-helpers';

export default class NewProgramYearComponent extends Component {
  allYears = [];
  @tracked year;

  get existingStartYears() {
    return mapBy(this.args.programYears ?? [], 'startYear').map(Number);
  }

  get selectedYear() {
    if (!this.year) {
      return this.availableAcademicYears[0];
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

  saveNewYear = dropTask(async () => {
    await this.args.save(this.selectedYear.value);
  });
}
