import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class CurriculumInventorySequenceBlockHeaderComponent extends Component {
  @service store;
  @tracked title;

  constructor() {
    super(...arguments);
    this.title = this.args.sequenceBlock.title;
  }

  validations = new YupValidations(this, {
    title: string().required().min(3).max(200),
  });

  @action
  revertTitleChanges() {
    this.title = this.args.sequenceBlock.title;
  }

  changeTitle = restartableTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    this.args.sequenceBlock.title = this.title;
    await this.args.sequenceBlock.save();
  });
}

<div
  class="curriculum-inventory-sequence-block-header"
  data-test-curriculum-inventory-sequence-block-header
  ...attributes
>
  <div class="title" data-test-title>
    {{#if @canUpdate}}
      <EditableField
        @value={{this.title}}
        @save={{perform this.changeTitle}}
        @close={{this.revertTitleChanges}}
        @saveOnEnter={{true}}
        @closeOnEscape={{true}}
        as |isSaving|
      >
        <input
          aria-label={{t "general.title"}}
          type="text"
          value={{this.title}}
          disabled={{isSaving}}
          {{on "input" (pick "target.value" (set this "title"))}}
          {{this.validations.attach "title"}}
        />
        <YupValidationMessage
          @description={{t "general.title"}}
          @validationErrors={{this.validations.errors.title}}
          data-test-title-validation-error-message
        />
      </EditableField>
    {{else}}
      <span class="h2">
        <FaIcon @icon="lock" />
        {{@sequenceBlock.title}}
      </span>
    {{/if}}
  </div>
</div>