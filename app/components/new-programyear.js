import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';

export default class NewProgramyearComponent extends Component {
  allYears;
  @tracked year;
  @tracked availableAcademicYears = [];

  get existingStartYears() {
    if (! this.args.programYears) {
      return [];
    }
    return this.args.programYears.mapBy('startYear');
  }

  get selectedYear() {
    if (! this.year) {
      return this.availableAcademicYears.firstObject;
    }
    return this.availableAcademicYears.findBy('value', this.year);
  }

  constructor() {
    super(...arguments);
    const firstYear = new Date().getFullYear() - 5;
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(firstYear + i);
    }
    this.allYears = years;
  }

  @action
  load() {
    this.availableAcademicYears = this.allYears.filter(year => {
      return ! this.existingStartYears.includes(year.toString());
    }).map((startYear) => {
      return {
        label: this.args.academicYearCrossesCalendarYearBoundaries ? `${startYear} - ${startYear + 1}` : startYear.toString(),
        value: startYear.toString(),
      };
    });
  }

  @dropTask
  *saveNewYear() {
    const startYear = this.selectedYear.value;
    yield this.args.save(startYear);
  }
}
