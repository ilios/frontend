import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import SelectedLearnerGroups from 'ilios-common/components/selected-learner-groups';
import t from 'ember-intl/helpers/t';
import SearchBox from 'ilios-common/components/search-box';
import { fn } from '@ember/helper';
import sortBy from 'ilios-common/helpers/sort-by';
import LearnergroupSelectionCohortManager from 'ilios-common/components/learnergroup-selection-cohort-manager';

export default class LearnergroupSelectionManagerComponent extends Component {
  @tracked filter = '';
  <template>
    <div class="learnergroup-selection-manager" data-test-learnergroup-selection-manager>
      <SelectedLearnerGroups
        @learnerGroups={{@learnerGroups}}
        @isManaging={{true}}
        @remove={{@remove}}
      />
      <div class="available-learner-groups" data-test-available-learner-groups>
        <label data-test-heading>
          {{t "general.availableLearnerGroups"}}:
        </label>
        <SearchBox @search={{fn (mut this.filter)}} placeholder={{t "general.filterPlaceholder"}} />
        <div class="cohorts-container" data-test-cohorts>
          {{#each (sortBy "title" @cohorts) as |cohort|}}
            <LearnergroupSelectionCohortManager
              @cohort={{cohort}}
              @learnerGroups={{@learnerGroups}}
              @add={{@add}}
              @remove={{@remove}}
              @filter={{this.filter}}
            />
          {{/each}}
        </div>
      </div>
    </div>
  </template>
}
