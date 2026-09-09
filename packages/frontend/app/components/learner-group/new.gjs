import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import ToggleButtons from 'ilios-common/components/toggle-buttons';
import set from 'ember-set-helper/helpers/set';
import NewSingle from './new-single';
import NewMultiple from './new-multiple';

export default class LearnerGroupNewComponent extends Component {
  @tracked singleMode = true;
  <template>
    <div class="new-learner-group" data-test-new-learner-group ...attributes>
      <div class="detail-content">
        {{#if @multiModeSupported}}
          <div class="multi-mode-chooser" data-test-multi-chooser>
            <label>
              {{t "general.createNew"}}:
            </label>
            <ToggleButtons
              @firstLabel={{t "general.singleGroup"}}
              @secondLabel={{t "general.multipleGroups"}}
              @firstOptionSelected={{this.singleMode}}
              @toggle={{set this "singleMode"}}
            />
          </div>
        {{else}}
          <h3>
            {{t "general.newLearnerGroup"}}
          </h3>
        {{/if}}
        {{#if this.singleMode}}
          <NewSingle
            @save={{@save}}
            @cancel={{@cancel}}
            @fillModeSupported={{@fillModeSupported}}
          />
        {{else}}
          <NewMultiple
            @generateNewLearnerGroups={{@generateNewLearnerGroups}}
            @cancel={{@cancel}}
          />
        {{/if}}
      </div>
    </div>
  </template>
}
