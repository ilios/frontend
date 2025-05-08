import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import { restartableTask } from 'ember-concurrency';

export default class SessionHeaderComponent extends Component {
  @tracked title;

  constructor() {
    super(...arguments);
    this.resetTitle();
  }

  validations = new YupValidations(this, {
    title: string().required().min(3).max(200),
  });

  changeTitle = restartableTask(async () => {
    this.validations.addErrorDisplayFor('title');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }

    this.validations.removeErrorDisplayFor('title');
    this.args.session.title = this.title;
    await this.args.session.save();
  });

  resetTitle = () => {
    this.title = this.args.session.title;
  };
}

<div class="session-header" data-test-session-header>
  <h3 class="title" data-test-title>
    {{#if @editable}}
      <EditableField
        @value={{this.title}}
        @save={{perform this.changeTitle}}
        @close={{this.resetTitle}}
        @saveOnEnter={{true}}
        @closeOnEscape={{true}}
        as |isSaving|
      >
        <input
          aria-label={{t "general.title"}}
          disabled={{isSaving}}
          type="text"
          value={{this.title}}
          {{on "input" (pick "target.value" (set this "title"))}}
          {{this.validations.attach "title"}}
        />
        <YupValidationMessage
          @description={{t "general.title"}}
          @validationErrors={{this.validations.errors.title}}
        />
      </EditableField>
    {{else}}
      {{@session.title}}
    {{/if}}
  </h3>
  <span class="session-publication">
    {{#if @editable}}
      <Session::PublicationMenu @session={{@session}} @hideCheckLink={{@hideCheckLink}} />
    {{else}}
      <PublicationStatus @item={{@session}} />
    {{/if}}
  </span>
</div>