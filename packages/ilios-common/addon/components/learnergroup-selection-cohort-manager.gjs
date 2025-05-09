import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import sortBy from 'ilios-common/helpers/sort-by';
import LearnergroupTree from 'ilios-common/components/learnergroup-tree';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class LearnergroupSelectionCohortManagerComponent extends Component {
  @service intl;

  @cached
  get learnerGroups() {
    return new TrackedAsyncData(this.args.cohort.learnerGroups);
  }

  get rootLevelLearnerGroups() {
    if (!this.learnerGroups.isResolved) {
      return [];
    }
    return this.learnerGroups.value.filter(
      (learnerGroup) => learnerGroup.belongsTo('parent').value() === null,
    );
  }

  @action
  sortByTitle(learnerGroupA, learnerGroupB) {
    const locale = this.intl.get('locale');
    return learnerGroupA.title.localeCompare(learnerGroupB.title, locale, {
      numeric: true,
    });
  }
  <template>
    <div
      class="learnergroup-selection-cohort-manager"
      data-test-learnergroup-selection-cohort-manager
    >
      {{#if this.learnerGroups.isResolved}}
        <h5 class="cohort-title" data-test-title-cohort-title>
          {{@cohort.programYear.program.title}}
          {{@cohort.title}}
        </h5>
        <ul class="tree-groups-list" data-test-tree-groups-list>
          {{#each (sortBy this.sortByTitle this.rootLevelLearnerGroups) as |learnerGroup|}}
            <LearnergroupTree
              @learnerGroup={{learnerGroup}}
              @selectedGroups={{@learnerGroups}}
              @filter={{@filter}}
              @add={{@add}}
              @remove={{@remove}}
            />
          {{/each}}
        </ul>
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </div>
  </template>
}
