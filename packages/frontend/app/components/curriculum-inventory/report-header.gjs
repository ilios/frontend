import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import EditableField from 'ilios-common/components/editable-field';
import t from 'ember-intl/helpers/t';
import perform from 'ember-concurrency/helpers/perform';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import FaIcon from 'ilios-common/components/fa-icon';
import not from 'ember-truth-helpers/helpers/not';

export default class CurriculumInventoryReportHeaderComponent extends Component {
  @tracked name;

  constructor() {
    super(...arguments);
    this.name = this.args.report.name;
  }

  validations = new YupValidations(this, {
    name: string().trim().required().max(60),
  });

  saveName = task({ restartable: true }, async () => {
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
  <template>
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
            as |keyboard isSaving|
          >
            <input
              aria-label={{t "general.title"}}
              type="text"
              value={{this.name}}
              disabled={{isSaving}}
              {{on "input" (pick "target.value" (set this "name"))}}
              {{this.validations.attach "name"}}
              {{keyboard}}
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
  </template>
}
