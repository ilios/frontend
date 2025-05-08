import Component from '@glimmer/component';
import { validatable, IsInt, Gt, Lte, NotBlank } from 'ilios-common/decorators/validation';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { uniqueId, fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import ValidationError from 'ilios-common/components/validation-error';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

@validatable
export default class LearnerGroupNewMultipleComponent extends Component {
  @tracked @IsInt() @Gt(0) @NotBlank() @Lte(50) numberOfGroups;
  @tracked fillWithCohort = false;

  save = dropTask(async () => {
    this.addErrorDisplayFor('numberOfGroups');
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('numberOfGroups');
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
            type="text"
            disabled={{this.save.isRunning}}
            placeholder={{t "general.numberOfGroupsToGenerate"}}
            value={{this.numberOfGroups}}
            {{on "focusout" (fn this.addErrorDisplayFor "numberOfGroups")}}
            {{on "keyup" this.keyboard}}
            {{on "keyup" (fn this.addErrorDisplayFor "numberOfGroups")}}
            {{on "input" (pick "target.value" (set this "numberOfGroups"))}}
            data-test-number-of-groups
          />
          <ValidationError @validatable={{this}} @property="numberOfGroups" />
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
