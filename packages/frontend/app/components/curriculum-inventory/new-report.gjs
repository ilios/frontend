import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class CurriculumInventoryNewReportComponent extends Component {
  @service store;
  @service iliosConfig;
  @service intl;

  currentYear = new Date().getFullYear();
  @tracked name;
  @tracked description;
  @tracked selectedYear;

  constructor() {
    super(...arguments);
    this.description = this.intl.t('general.curriculumInventoryReport');
    this.selectedYear = this.currentYear;
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
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
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

{{! template-lint-disable attribute-indentation }}
<div class="curriculum-inventory-new-report" data-test-curriculum-inventory-new-report>
  {{#let (unique-id) as |templateId|}}
    <h4>
      {{t "general.newCurriculumInventoryReport"}}
    </h4>
    <div class="form">
      <div class="item" data-test-name>
        <label for="name-{{templateId}}">
          {{t "general.name"}}:
        </label>
        <input
          id="name-{{templateId}}"
          type="text"
          value={{this.name}}
          disabled={{this.save.isRunning}}
          placeholder={{t "general.reportNamePlaceholder"}}
          {{on "keyup" (perform this.keyboard)}}
          {{on "input" (pick "target.value" (set this "name"))}}
          {{this.validations.attach "name"}}
        />
        <YupValidationMessage
          @description={{t "general.name"}}
          @validationErrors={{this.validations.errors.name}}
          data-test-name-validation-error-message
        />
      </div>
      <div class="item" data-test-description>
        <label for="description-{{templateId}}">
          {{t "general.description"}}:
        </label>
        <textarea
          id="description-{{templateId}}"
          disabled={{this.save.isRunning}}
          placeholder={{t "general.reportDescriptionPlaceholder"}}
          {{on "input" (pick "target.value" (set this "description"))}}
          {{this.validations.attach "description"}}
        >{{this.description}}</textarea>
        <YupValidationMessage
          @description={{t "general.description"}}
          @validationErrors={{this.validations.errors.description}}
          data-test-description-validation-error-message
        />
      </div>
      <div class="item" data-test-program-title>
        <label>
          {{t "general.program"}}:
        </label>
        <span>
          {{@currentProgram.title}}
        </span>
      </div>
      <div class="item" data-test-academic-year>
        <label for="academicYear-{{templateId}}">
          {{t "general.academicYear"}}:
        </label>
        <select
          id="academicYear-{{templateId}}"
          disabled={{this.save.isRunning}}
          {{on "change" (pick "target.value" this.setSelectedYear)}}
        >
          {{#each this.years as |year|}}
            <option
              value={{year.id}}
              selected={{eq year.id this.selectedYear}}
            >{{year.title}}</option>
          {{/each}}
        </select>
      </div>
      <div class="buttons">
        <button type="button" class="done text" {{on "click" (perform this.save)}} data-test-save>
          {{#if this.save.isRunning}}
            <LoadingSpinner />
          {{else}}
            {{t "general.done"}}
          {{/if}}
        </button>
        <button type="button" class="cancel text" {{on "click" @cancel}} data-test-cancel>
          {{t "general.cancel"}}
        </button>
      </div>
    </div>
  {{/let}}
</div>