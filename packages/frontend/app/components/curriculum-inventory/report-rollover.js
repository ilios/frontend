import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { findBy, findById } from 'ilios-common/utils/array-helpers';

@validatable
export default class CurriculumInventoryReportRolloverComponent extends Component {
  @service fetch;
  @service flashMessages;
  @service iliosConfig;
  @service store;

  currentYear = new Date().getFullYear();
  @tracked @NotBlank() @Length(3, 200) name;
  @tracked @NotBlank() @Length(1, 21844) description;
  @tracked selectedYear;
  @tracked selectedProgram;

  constructor() {
    super(...arguments);
    this.name = this.args.report.name;
    this.description = this.args.report.description;
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

  get reportYear() {
    return parseInt(this.args.report.year, 10);
  }

  get startYear() {
    return Math.min(this.currentYear, this.reportYear);
  }

  get endYear() {
    return Math.max(this.currentYear, this.reportYear) + 5;
  }

  get years() {
    const rhett = [];
    for (let i = this.startYear; i < this.endYear; i++) {
      // Rollover into the same year as the source report's year is VERBOTEN.
      if (i === this.reportYear) {
        continue;
      }
      const title = this.academicYearCrossesCalendarYearBoundaries
        ? `${i} - ${i + 1}`
        : i.toString();
      rhett.push({
        year: i,
        title,
      });
    }
    return rhett;
  }

  get defaultSelectedYear() {
    let selectedYear = findBy(this.years, 'year', this.startYear + 1);
    if (!selectedYear) {
      selectedYear = findBy(this.years, 'year', this.reportYear + 1);
    }
    return selectedYear.year;
  }

  @cached
  get programsData() {
    return new TrackedAsyncData(this.getPrograms(this.args.report));
  }

  get programs() {
    return this.programsData.isResolved ? this.programsData.value : [];
  }

  async getPrograms(report) {
    const program = await report.program;
    const school = await program.school;
    return school.programs;
  }

  @cached
  get defaultSelectedProgramData() {
    return new TrackedAsyncData(this.args.report.program);
  }

  get defaultSelectedProgram() {
    return this.defaultSelectedProgramData.isResolved
      ? this.defaultSelectedProgramData.value
      : null;
  }

  get programsDataLoaded() {
    return this.defaultSelectedProgramData.isResolved && this.programsData.isResolved;
  }

  @action
  changeName(newName) {
    this.name = newName;
  }

  @action
  setSelectedYear(value) {
    this.selectedYear = parseInt(value, 10);
  }

  @action
  changeProgram(id) {
    this.selectedProgram = findById(this.programs, id);
  }

  @action
  async saveOnEnter(event) {
    if (13 === event.keyCode) {
      await this.save.perform();
    }
  }

  save = dropTask(async () => {
    this.addErrorDisplaysFor(['name', 'description']);
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    const data = {
      name: this.name,
      description: this.description,
      year: this.selectedYear ? this.selectedYear : this.defaultSelectedYear,
      program: this.selectedProgram ? this.selectedProgram.id : this.defaultSelectedProgram.id,
    };
    const url = `curriculuminventoryreports/${this.args.report.id}/rollover`;
    const newReportObj = await this.fetch.postQueryToApi(url, data);
    this.flashMessages.success('general.curriculumInventoryReportRolloverSuccess');
    this.store.pushPayload(newReportObj);
    const newReport = this.store.peekRecord('curriculum-inventory-report', newReportObj.data.id);
    this.clearErrorDisplay();
    return this.args.visit(newReport);
  });
}
