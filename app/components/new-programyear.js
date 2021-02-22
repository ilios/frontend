import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency-decorators';

export default class NewProgramyearComponent extends Component {
  @tracked year;

  get selectedYear() {
    if (! this.year) {
      return this.args.availableAcademicYears.firstObject;
    }
    return this.args.availableAcademicYears.findBy('value', parseInt(this.year, 10));
  }

  @dropTask
  *saveNewYear() {
    const startYear = parseInt(this.selectedYear.value, 10);
    yield this.args.save(startYear);
  }
}
