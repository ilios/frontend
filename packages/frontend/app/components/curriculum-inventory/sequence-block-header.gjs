import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
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
import FaIcon from 'ilios-common/components/fa-icon';
import focus from 'ilios-common/modifiers/focus';

export default class CurriculumInventorySequenceBlockHeaderComponent extends Component {
  @service store;
  @tracked titleBuffer;

  validations = new YupValidations(this, {
    title: string().ensure().trim().min(3).max(200),
  });

  get title() {
    return this.titleBuffer ?? this.args.sequenceBlock.title;
  }

  @action
  revertTitleChanges() {
    this.validations.removeErrorDisplayFor('title');
    this.titleBuffer = null;
  }

  changeTitle = task({ restartable: true }, async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    this.args.sequenceBlock.title = this.title;
    this.titleBuffer = null;
    await this.args.sequenceBlock.save();
  });
  <template>
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
            as |keyboard isSaving|
          >
            <input
              aria-label={{t "general.title"}}
              type="text"
              value={{this.title}}
              disabled={{isSaving}}
              {{on "input" (pick "target.value" (set this "titleBuffer"))}}
              {{this.validations.attach "title"}}
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
          <span class="h2">
            <FaIcon @icon="lock" />
            {{@sequenceBlock.title}}
          </span>
        {{/if}}
      </div>
    </div>
  </template>
}
