import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class CurriculumInventoryNewReportComponent extends Component {
  @service store;
  @service iliosConfig;
  @service intl;

  currentYear = new Date().getFullYear();
  @tracked @NotBlank() @Length(1, 60) name;
  @tracked @NotBlank() @Length(1, 21844) description;
  @tracked selectedYear;

  constructor() {
    super(...arguments);
    this.description = this.intl.t('general.curriculumInventoryReport');
    this.selectedYear = this.currentYear;
  }

  @cached
  get academicYearCrossesCalendarYearBoundariesData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    );
  }

  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearCrossesCalendarYearBoundariesData.isResolved
      ? this.academicYearCrossesCalendarYearBoundariesData.value
      : false;
  }

  get years() {
    const rhett = [];
    for (let year = this.currentYear - 5, n = this.currentYear + 5; year <= n; year++) {
      rhett.push({
        id: year,
        title: this.academicYearCrossesCalendarYearBoundaries ? `${year} - ${year + 1}` : `${year}`,
      });
    }
    return rhett;
  }

  save = dropTask(async () => {
    this.addErrorDisplaysFor(['name', 'description']);
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    const year = this.selectedYear;
    const startDate = this.academicYearCrossesCalendarYearBoundaries
      ? new Date(year, 6, 1)
      : new Date(year, 0, 1);
    const endDate = this.academicYearCrossesCalendarYearBoundaries
      ? new Date(year + 1, 5, 30)
      : new Date(year, 11, 31);
    const report = this.store.createRecord('curriculum-inventory-report', {
      name: this.name,
      program: this.args.currentProgram,
      year: year,
      startDate,
      endDate,
      description: this.description,
    });
    await this.args.save(report);
  });

  @action
  setSelectedYear(year) {
    this.selectedYear = Number(year);
  }

  keyboard = dropTask(async (ev) => {
    const keyCode = ev.keyCode;

    if (13 === keyCode) {
      await this.save.perform();
      return;
    }

    if (27 === keyCode) {
      this.args.cancel();
    }
  });
}
