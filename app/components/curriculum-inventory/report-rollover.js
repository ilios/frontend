import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class CurriculumInventoryReportRolloverComponent extends Component {
  @service fetch;
  @service flashMessages;
  @service iliosConfig;
  @service store;

  @tracked @NotBlank() @Length(3, 200) name;
  @tracked @NotBlank() @Length(1, 21844) description;
  @tracked selectedYear;
  @tracked years = [];
  @tracked selectedProgram;
  @tracked programs = [];

  @restartableTask
  *load() {
    const academicYearCrossesCalendarYearBoundaries = yield this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
    const thisYear = new Date().getFullYear();
    const reportYear = parseInt(this.args.report.year, 10);
    const startYear = Math.min(thisYear, reportYear);
    const endYear = Math.max(thisYear, reportYear) + 5;
    const years = [];
    for (let i = startYear; i < endYear; i++) {
      if (i === reportYear) {
        continue;
      }
      const title = academicYearCrossesCalendarYearBoundaries ? `${i} - ${i + 1}` : i.toString();
      years.pushObject({
        year: i,
        title,
      });
    }
    let selectedYear = years.findBy('year', startYear + 1);
    if (!selectedYear) {
      selectedYear = years.findBy('year', reportYear + 1);
    }

    const program = yield this.args.report.program;
    const school = yield program.school;
    const programs = yield school.programs;

    this.selectedProgram = program;
    this.programs = programs.slice();
    this.years = years;
    this.selectedYear = selectedYear.year;
    this.name = this.args.report.name;
    this.description = this.args.report.description;
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
    this.selectedProgram = this.programs.findBy('id', id);
  }

  @action
  async saveOnEnter(event) {
    if (13 === event.keyCode) {
      await this.save.perform();
    }
  }

  @dropTask
  *save() {
    this.addErrorDisplaysFor(['name', 'description']);
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    const data = {
      name: this.name,
      description: this.description,
      year: this.selectedYear,
      program: this.selectedProgram.id,
    };
    const url = `curriculuminventoryreports/${this.args.report.id}/rollover`;
    const newReportObj = yield this.fetch.postQueryToApi(url, data);
    this.flashMessages.success('general.curriculumInventoryReportRolloverSuccess');
    this.store.pushPayload(newReportObj);
    const newReport = this.store.peekRecord('curriculum-inventory-report', newReportObj.data.id);
    this.clearErrorDisplay();
    return this.args.visit(newReport);
  }
}
