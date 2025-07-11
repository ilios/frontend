import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { findBy, findById } from 'ilios-common/utils/array-helpers';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import scrollIntoView from 'ilios-common/modifiers/scroll-into-view';
import t from 'ember-intl/helpers/t';
import { uniqueId } from '@ember/helper';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import set from 'ember-set-helper/helpers/set';
import eq from 'ember-truth-helpers/helpers/eq';
import gt from 'ember-truth-helpers/helpers/gt';
import sortBy from 'ilios-common/helpers/sort-by';
import or from 'ember-truth-helpers/helpers/or';
import not from 'ember-truth-helpers/helpers/not';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import { LinkTo } from '@ember/routing';

export default class CurriculumInventoryReportRolloverComponent extends Component {
  @service fetch;
  @service flashMessages;
  @service iliosConfig;
  @service store;

  currentYear = new Date().getFullYear();
  @tracked name;
  @tracked description;
  @tracked selectedYear;
  @tracked selectedProgram;

  constructor() {
    super(...arguments);
    this.name = this.args.report.name;
    this.description = this.args.report.description;
  }

  validations = new YupValidations(this, {
    name: string().trim().required().max(60),
    description: string().trim().required().max(21844),
  });

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

  get defaultYear() {
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
  get defaultProgramData() {
    return new TrackedAsyncData(this.args.report.program);
  }

  get defaultProgram() {
    return this.defaultProgramData.isResolved ? this.defaultProgramData.value : null;
  }

  get programsDataLoaded() {
    return this.defaultProgramData.isResolved && this.programsData.isResolved;
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
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    const data = {
      name: this.name,
      description: this.description,
      year: this.selectedYear ? this.selectedYear : this.defaultYear,
      program: this.selectedProgram ? this.selectedProgram.id : this.defaultProgram.id,
    };
    const url = `curriculuminventoryreports/${this.args.report.id}/rollover`;
    const newReportObj = await this.fetch.postQueryToApi(url, data);
    this.flashMessages.success('general.curriculumInventoryReportRolloverSuccess');
    this.store.pushPayload(newReportObj);
    const newReport = this.store.peekRecord('curriculum-inventory-report', newReportObj.data.id);
    return this.args.visit(newReport);
  });
  <template>
    <div
      class="curriculum-inventory-report-rollover"
      data-test-curriculum-inventory-report-rollover
    >
      {{#unless this.load.isRunning}}
        <div class="rollover-form" {{scrollIntoView}}>
          <h2 class="title">
            {{t "general.curriculumInventoryReportRollover"}}
          </h2>
          <p class="rollover-summary">
            {{t "general.curriculumInventoryReportRolloverSummary"}}
          </p>
          <div class="item name" data-test-name>
            {{#let (uniqueId) as |nameId|}}
              <label for={{nameId}}>
                {{t "general.name"}}:
              </label>
              <input
                id={{nameId}}
                type="text"
                value={{this.name}}
                disabled={{this.save.isRunning}}
                placeholder={{t "general.reportNamePlaceholder"}}
                {{on "input" (pick "target.value" this.changeName)}}
                {{on "keyup" this.saveOnEnter}}
                {{this.validations.attach "name"}}
              />
            {{/let}}
            <YupValidationMessage
              @description={{t "general.name"}}
              @validationErrors={{this.validations.errors.name}}
              data-test-name-validation-error-message
            />
          </div>
          <div class="item description" data-test-description>
            {{#let (uniqueId) as |descriptionId|}}
              <label for={{descriptionId}}>
                {{t "general.description"}}:
              </label>
              <textarea
                id={{descriptionId}}
                {{on "input" (pick "target.value" (set this "description"))}}
                disabled={{this.save.isRunning}}
                placeholder={{t "general.reportDescriptionPlaceholder"}}
                {{this.validations.attach "description"}}
              >{{this.description}}</textarea>
              <YupValidationMessage
                @description={{t "general.description"}}
                @validationErrors={{this.validations.errors.description}}
                data-test-description-validation-error-message
              />
            {{/let}}
          </div>
          <div class="item years" data-test-years>
            {{#let (uniqueId) as |yearId|}}
              <label for={{yearId}}>
                {{t "general.academicYear"}}:
              </label>
              <select
                id={{yearId}}
                disabled={{this.save.isRunning}}
                {{on "change" (pick "target.value" this.setSelectedYear)}}
              >
                {{#each this.years as |obj|}}
                  <option
                    value={{obj.year}}
                    selected={{eq obj.year this.defaultYear}}
                  >{{obj.title}}</option>
                {{/each}}
              </select>
            {{/let}}
          </div>
          <div class="item programs" data-test-programs>
            {{#if this.programsDataLoaded}}
              {{#let (uniqueId) as |programId|}}
                <label for={{programId}}>
                  {{t "general.program"}}:
                </label>
                {{#if (gt this.programs.length 1)}}
                  <select
                    id={{programId}}
                    disabled={{this.save.isRunning}}
                    {{on "change" (pick "target.value" this.changeProgram)}}
                  >
                    {{#each (sortBy "title" this.programs) as |program|}}
                      <option value={{program.id}} selected={{eq program this.defaultProgram}}>
                        {{program.title}}
                      </option>
                    {{/each}}
                  </select>
                {{else}}
                  {{this.defaultProgram.title}}
                {{/if}}
              {{/let}}
            {{/if}}
          </div>
          <div class="buttons">
            <button
              type="button"
              class="done text"
              disabled={{or (not this.programsDataLoaded) this.save.isRunning}}
              {{on "click" (perform this.save)}}
              data-test-save
            >
              {{#if this.save.isRunning}}
                <LoadingSpinner />
              {{else}}
                {{t "general.done"}}
              {{/if}}
            </button>
            <LinkTo @route="curriculum-inventory-report" @model={{@report}}>
              <button type="button" class="cancel text" data-test-cancel>
                {{t "general.cancel"}}
              </button>
            </LinkTo>
          </div>
        </div>
      {{/unless}}
    </div>
  </template>
}
