import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import EditableField from 'ilios-common/components/editable-field';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';

export default class CompetencyTitleEditorComponent extends Component {
  @tracked title;

  constructor() {
    super(...arguments);
    this.title = this.args.competency.title;
  }

  validations = new YupValidations(this, {
    title: string().required().max(200),
  });

  @action
  revert() {
    this.title = this.args.competency.title;
  }

  save = task({ drop: true }, async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.args.competency.title = this.title;
    this.validations.clearErrorDisplay();
  });
  <template>
    <span class="competency-title-editor" data-test-competency-title-editor>
      {{#if @canUpdate}}
        <EditableField
          @value={{this.title}}
          @save={{perform this.save}}
          @close={{this.revert}}
          @saveOnEnter={{true}}
          data-test-title
          @closeOnEscape={{true}}
          as |isSaving|
        >
          <input
            type="text"
            value={{this.title}}
            disabled={{isSaving}}
            aria-label={{t "general.title"}}
            {{on "input" (pick "target.value" (set this "title"))}}
            {{this.validations.attach "title"}}
          />
        </EditableField>
        <YupValidationMessage
          @description={{t "general.title"}}
          @validationErrors={{this.validations.errors.title}}
          data-test-title-validation-error-message
        />
      {{else}}
        {{this.title}}
      {{/if}}
    </span>
  </template>
}
