import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import { task } from 'ember-concurrency';
import EditableField from 'ilios-common/components/editable-field';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import PublicationMenu from 'ilios-common/components/session/publication-menu';
import PublicationStatus from 'ilios-common/components/publication-status';

export default class SessionHeaderComponent extends Component {
  @tracked title;

  constructor() {
    super(...arguments);
    this.resetTitle();
  }

  validations = new YupValidations(this, {
    title: string().required().min(3).max(200),
  });

  changeTitle = task({ restartable: true }, async () => {
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
  <template>
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
          <PublicationMenu @session={{@session}} @hideCheckLink={{@hideCheckLink}} />
        {{else}}
          <PublicationStatus @item={{@session}} />
        {{/if}}
      </span>
    </div>
  </template>
}
