import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';

export default class SchoolNewCompetencyComponent extends Component {
  @tracked title;

  validations = new YupValidations(this, {
    title: string().required().max(200),
  });

  cancelOrSave = task({ drop: true }, async (event) => {
    const keyCode = event.keyCode;

    if (13 === keyCode) {
      await this.save.perform();
      return;
    }

    if (27 === keyCode) {
      this.validations.removeErrorDisplayFor('title');
      this.title = null;
    }
  });

  save = task({ drop: true }, async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    const title = this.title;
    await this.args.add(title);
    this.validations.clearErrorDisplay();
    this.title = null;
  });
  <template>
    <div class="school-new-competency" data-test-school-new-competency ...attributes>
      <input
        type="text"
        value={{this.title}}
        disabled={{this.save.isRunning}}
        data-test-title
        {{on "input" (pick "target.value" (set this "title"))}}
        {{on "keyup" (perform this.cancelOrSave)}}
        {{this.validations.attach "title"}}
        placeholder={{t "general.title"}}
        aria-label={{t "general.title"}}
      />
      <button
        type="button"
        class="save text"
        disabled={{this.save.isRunning}}
        data-test-save
        {{on "click" (perform this.save)}}
      >
        {{#if this.save.isRunning}}
          <LoadingSpinner />
        {{else}}
          {{t "general.add"}}
        {{/if}}
      </button>
      <YupValidationMessage
        @description={{t "general.title"}}
        @validationErrors={{this.validations.errors.title}}
        data-test-title-validation-error-message
      />
    </div>
  </template>
}
