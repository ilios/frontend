import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask, restartableTask } from 'ember-concurrency';

@validatable
export default class CurriculumInventoryNewReportComponent extends Component {
  @service store;
  @service iliosConfig;

  @tracked @NotBlank() @Length(1, 60) name;
  @tracked description;
  @tracked selectedYear;
  @tracked years;
  @tracked academicYearCrossesCalendarYearBoundaries;

  @restartableTask
  *load() {
    const years = [];
    const currentYear = new Date().getFullYear();
    this.academicYearCrossesCalendarYearBoundaries = yield this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
    for (let id = currentYear - 5, n = currentYear + 5; id <= n; id++) {
      let title = id.toString();
      if (this.academicYearCrossesCalendarYearBoundaries) {
        title = title + ' - ' + (id + 1);
      }
      const year = { id, title };
      years.pushObject(year);
    }
    this.years = years;
    this.selectedYear = years.findBy('id', currentYear);
  }

  @dropTask
  *save() {
    this.addErrorDisplayFor('name');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    const year = this.selectedYear.id;
    const startDate = this.academicYearCrossesCalendarYearBoundaries
      ? new Date(year, 6, 1)
      : new Date(year, 0, 1);
    const endDate = this.academicYearCrossesCalendarYearBoundaries
      ? new Date(year + 1, 5, 30)
      : new Date(year, 11, 31);
    const report = this.store.createRecord('curriculumInventoryReport', {
      name: this.name,
      program: this.args.currentProgram,
      year: year,
      startDate,
      endDate,
      description: this.description,
    });
    yield this.args.save(report);
  }

  @action
  setSelectedYear(year) {
    const id = Number(year);
    this.selectedYear = this.years.findBy('id', id);
  }

  @dropTask
  *keyboard(ev) {
    const keyCode = ev.keyCode;

    if (13 === keyCode) {
      yield this.save.perform();
      return;
    }

    if (27 === keyCode) {
      this.args.cancel();
    }
  }
}
