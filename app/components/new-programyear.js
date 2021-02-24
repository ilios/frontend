import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';

export default class NewProgramyearComponent extends Component {
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
    return this.availableAcademicYears.findBy('value', parseInt(this.year, 10));
  }

  @action
  load() {
    const firstYear = new Date().getFullYear() - 5;
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(firstYear + i);
    }
    this.availableAcademicYears = years.filter(year => {
      return ! this.existingStartYears.includes(year.toString());
    }).map((startYear) => {
      return {
        label: this.args.academicYearCrossesCalendarYearBoundaries ? `${startYear} - ${startYear + 1}` : startYear.toString(),
        value: startYear,
      };
    });
  }

  @dropTask
  *saveNewYear() {
    const startYear = parseInt(this.selectedYear.value, 10);
    yield this.args.save(startYear);
  }
}
