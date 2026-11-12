import { uniqueId } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import set from 'ember-set-helper/helpers/set';
import { number } from 'yup';

import YupValidations from '../../classes/yup-validations';
import pick from '../../helpers/pick';
import focus from '../../modifiers/focus';
import LoadingSpinner from '../loading-spinner';
import YupValidationMessage from '../yup-validation-message';

export default class LearnerGroupNewMultipleComponent extends Component {
  @tracked numberOfGroups;
  @tracked fillWithCohort = false;

  validations = new YupValidations(this, {
    numberOfGroups: number().required().integer().min(1).max(50),
  });

  save = task({ drop: true }, async () => {
    this.validations.addErrorDisplayFor('numberOfGroups');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('numberOfGroups');
    await this.args.generateNewLearnerGroups(this.numberOfGroups);
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
      <div class="form" data-test-learner-group-new-multiple>
        <div class="item">
          <label for="groups-{{templateId}}">
            {{t "general.numberOfGroups"}}:
          </label>
          <input
            id="groups-{{templateId}}"
            {{focus}}
            type="text"
            disabled={{this.save.isRunning}}
            placeholder={{t "general.numberOfGroupsToGenerate"}}
            value={{this.numberOfGroups}}
            {{on "keyup" this.keyboard}}
            {{on "input" (pick "target.value" (set this "numberOfGroups"))}}
            {{this.validations.attach "numberOfGroups"}}
          />
          <YupValidationMessage
            @description={{t "general.numberOfGroups"}}
            @validationErrors={{this.validations.errors.numberOfGroups}}
            data-test-number-of-groups-validation-error-message
          />
        </div>
        <div class="buttons">
          <button type="button" class="done text" {{on "click" (perform this.save)}} data-test-save>
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
    {{/let}}
  </template>
}
