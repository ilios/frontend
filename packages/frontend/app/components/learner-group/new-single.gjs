import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import focus from 'ilios-common/modifiers/focus';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import toggle from 'ilios-common/helpers/toggle';
import { not } from 'ember-truth-helpers';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class LearnerGroupNewSingleComponent extends Component {
  @tracked title;
  @tracked fillWithCohort = false;

  validations = new YupValidations(this, {
    title: string().required().min(3).max(60),
  });

  save = task({ drop: true }, async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    return this.args.save(this.title, this.fillWithCohort);
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
      <div class="form" ...attributes data-test-new-single-learner-group>
        <div class="item" data-test-title>
          <label for="title-{{templateId}}">
            {{t "general.title"}}:
          </label>
          <input
            id="title-{{templateId}}"
            {{focus}}
            type="text"
            disabled={{this.save.isRunning}}
            placeholder={{t "general.learnerGroupTitlePlaceholder"}}
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
        {{#if @fillModeSupported}}
          <div class="item">
            <label>
              {{t "general.populateGroup"}}:
            </label>
            <div>
              <label data-test-fill>
                <input
                  checked={{this.fillWithCohort}}
                  type="radio"
                  {{on "click" (toggle "fillWithCohort" this)}}
                />
                {{t "general.yesPopulateGroup"}}
              </label>
            </div>
            <div>
              <label data-test-no-fill>
                <input
                  checked={{not this.fillWithCohort}}
                  type="radio"
                  {{on "click" (toggle "fillWithCohort" this)}}
                />
                {{t "general.noPopulateGroup"}}
              </label>
            </div>
          </div>
        {{/if}}
        <div class="buttons">
          <button type="button" class="done text" {{on "click" (perform this.save)}}>
            {{#if this.save.isRunning}}
              <LoadingSpinner />
            {{else}}
              {{t "general.done"}}
            {{/if}}
          </button>
          <button type="button" class="cancel text" {{on "click" @cancel}}>
            {{t "general.cancel"}}
          </button>
        </div>
      </div>
    {{/let}}
  </template>
}
