import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class CurriculumInventoryReportHeaderComponent extends Component {
  @tracked name;

  constructor() {
    super(...arguments);
    this.name = this.args.report.name;
  }

  validations = new YupValidations(this, {
    name: string().trim().required().max(60),
  });

  saveName = restartableTask(async () => {
    this.validations.addErrorDisplayFor('name');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay('name');
    this.args.report.set('name', this.name);
    await this.args.report.save();
    this.name = this.args.report.name;
  });

  @action
  revertNameChanges() {
    this.validations.clearErrorDisplay('name');
    this.name = this.args.report.name;
  }
}

<div
  class="curriculum-inventory-report-header"
  data-test-curriculum-inventory-report-header
  ...attributes
>
  <div class="title" data-test-name>
    {{#if @canUpdate}}
      <EditableField
        @value={{if this.name this.name (t "general.clickToEdit")}}
        @save={{perform this.saveName}}
        @close={{this.revertNameChanges}}
        @saveOnEnter={{true}}
        @closeOnEscape={{true}}
        as |isSaving|
      >
        <input
          aria-label={{t "general.title"}}
          type="text"
          value={{this.name}}
          disabled={{isSaving}}
          {{on "input" (pick "target.value" (set this "name"))}}
          {{this.validations.attach "name"}}
        />
        <YupValidationMessage
          @description={{t "general.name"}}
          @validationErrors={{this.validations.errors.name}}
          data-test-name-validation-error-message
        />
      </EditableField>
    {{else}}
      <h2 data-test-locked-name>
        <FaIcon @icon="lock" />
        {{@report.name}}
      </h2>
    {{/if}}
  </div>
  <div class="actions">
    <a
      class="download"
      download="report.xml"
      href={{@report.absoluteFileUri}}
      rel="noopener noreferrer"
      target="_blank"
      data-test-download
    >
      {{t "general.download"}}
    </a>
    <button
      type="button"
      class="finalize"
      disabled={{not @canUpdate}}
      {{on "click" @finalize}}
      data-test-finalize
    >
      {{t "general.finalize"}}
      {{#if @isFinalizing}}
        <FaIcon @icon="spinner" @spin={{true}} />
      {{/if}}
    </button>
  </div>
</div>