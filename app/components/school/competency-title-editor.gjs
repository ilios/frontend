import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import set from 'ember-set-helper/helpers/set';
import { string } from 'yup';

import YupValidations from '../../classes/yup-validations';
import pick from '../../helpers/pick';
import focus from '../../modifiers/focus';
import EditableField from '../editable-field';
import YupValidationMessage from '../yup-validation-message';

export default class SchoolCompetencyTitleEditorComponent extends Component {
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
    <span class="school-competency-title-editor" data-test-school-competency-title-editor>
      {{#if @canUpdate}}
        <EditableField
          @value={{this.title}}
          @save={{perform this.save}}
          @close={{this.revert}}
          data-test-title
          as |keyboard isSaving|
        >
          <input
            type="text"
            value={{this.title}}
            disabled={{isSaving}}
            aria-label={{t "general.title"}}
            {{on "input" (pick "target.value" (set this "title"))}}
            {{this.validations.attach "title"}}
            {{keyboard}}
            {{focus}}
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
