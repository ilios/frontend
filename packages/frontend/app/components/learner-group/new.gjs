import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import ClickChoiceButtons from 'ilios-common/components/click-choice-buttons';
import set from 'ember-set-helper/helpers/set';
import NewSingle from 'frontend/components/learner-group/new-single';
import NewMultiple from 'frontend/components/learner-group/new-multiple';

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
            <ClickChoiceButtons
              @buttonContent1={{t "general.singleGroup"}}
              @buttonContent2={{t "general.multipleGroups"}}
              @firstChoicePicked={{this.singleMode}}
              @toggle={{set this "singleMode"}}
            />
          </div>
        {{else}}
          <h4>
            {{t "general.newLearnerGroup"}}
          </h4>
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
