import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class NewProgramComponent extends Component {
  @service store;

  @tracked title;

  validations = new YupValidations(this, {
    title: string().required().min(3).max(200),
  });

  save = task({ drop: true }, async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    const program = this.store.createRecord('program', {
      title: this.title,
    });
    await this.args.save(program);
  });

  @action
  async keyboard({ keyCode }) {
    if (13 === keyCode) {
      await this.save.perform();
      return;
    }

    if (27 === keyCode) {
      this.args.cancel();
    }
  }
  <template>
    {{#let (uniqueId) as |templateId|}}
      <div class="new-program" data-test-program-new>
        <h3>
          {{t "general.newProgram"}}
        </h3>
        <div class="form">
          <div class="title" data-test-title>
            <label for="title-{{templateId}}">
              {{t "general.title"}}:
            </label>
            <input
              id="title-{{templateId}}"
              type="text"
              disabled={{this.save.isRunning}}
              placeholder={{t "general.programTitlePlaceholder"}}
              value={{this.title}}
              {{on "keyup" this.keyboard}}
              {{on "input" (pick "target.value" (set this "title"))}}
              {{this.validations.attach "title"}}
            />
            <YupValidationMessage
              @description={{t "general.title"}}
              @validationErrors={{this.validations.errors.title}}
              data-test-title-validation-error-message
            />
          </div>
          <div class="buttons">
            <button
              type="button"
              class="done text"
              {{on "click" (perform this.save)}}
              data-test-done
            >
              {{#if this.save.isRunning}}
                <LoadingSpinner />
              {{else}}
                {{t "general.done"}}
              {{/if}}
            </button>
            <button type="button" class="cancel text" {{on "click" @cancel}} data-test-cancel>
              {{t "general.cancel"}}
            </button>
          </div>
        </div>
      </div>
    {{/let}}
  </template>
}
