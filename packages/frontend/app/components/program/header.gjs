import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class ProgramHeaderComponent extends Component {
  @tracked title;

  constructor() {
    super(...arguments);
    this.title = this.args.program.title;
  }

  validations = new YupValidations(this, {
    title: string().required().min(3).max(200),
  });

  changeTitle = dropTask(async () => {
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
}

{{#let (unique-id) as |id|}}
  <div class="program-header" data-test-program-header ...attributes>
    <h2 class="title" data-test-title>
      {{#if @canUpdate}}
        <EditableField
          @value={{this.title}}
          @save={{perform this.changeTitle}}
          @close={{set this "title" @program.title}}
          @saveOnEnter={{true}}
          @clickPrompt={{t "general.clickToEdit"}}
          @closeOnEscape={{true}}
          as |isSaving|
        >
          <input
            id="{{id}}-title"
            type="text"
            value={{this.title}}
            {{on "input" (pick "target.value" (set this "title"))}}
            {{this.validations.attach "title"}}
            disabled={{isSaving}}
          />
        </EditableField>
        <YupValidationMessage
          @description={{t "general.title"}}
          @validationErrors={{this.validations.errors.title}}
          data-test-title-validation-error-message
        />
      {{else}}
        <h2>{{@program.title}}</h2>
      {{/if}}
    </h2>
  </div>
{{/let}}