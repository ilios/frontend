import { on } from '@ember/modifier';
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

export default class ProgramHeaderComponent extends Component {
  @tracked title;

  constructor() {
    super(...arguments);
    this.title = this.args.program.title;
  }

  validations = new YupValidations(this, {
    title: string().ensure().trim().min(3).max(200),
  });

  changeTitle = task({ drop: true }, async () => {
    if (this.title !== this.args.program.title) {
      this.validations.addErrorDisplayForAllFields();
      const isValid = await this.validations.isValid();
      if (!isValid) {
        return false;
      }
      this.args.program.set('title', this.title);
      await this.args.program.save();
      this.title = this.args.program.title;
      this.validations.clearErrorDisplay();
    }
  });
  <template>
    <div class="program-header" data-test-program-header ...attributes>
      <h2 class="title" data-test-title>
        {{#if @canUpdate}}
          <EditableField
            @value={{this.title}}
            @save={{perform this.changeTitle}}
            @close={{set this "title" @program.title}}
            @clickPrompt={{t "general.clickToEdit"}}
            as |keyboard isSaving|
          >
            <input
              type="text"
              value={{this.title}}
              aria-label={{t "general.programTitle"}}
              {{on "input" (pick "target.value" (set this "title"))}}
              {{this.validations.attach "title"}}
              disabled={{isSaving}}
              {{keyboard}}
              {{focus}}
            />
            <YupValidationMessage
              @description={{t "general.title"}}
              @validationErrors={{this.validations.errors.title}}
              data-test-title-validation-error-message
            />
          </EditableField>
        {{else}}
          <h2>{{@program.title}}</h2>
        {{/if}}
      </h2>
    </div>
  </template>
}
