import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import sortBy from 'ilios-common/helpers/sort-by';
import SelectedTermTree from 'ilios-common/components/dashboard/selected-term-tree';

export default class DashboardSelectedVocabularyComponent extends Component {
  @cached
  get topLevelTermsData() {
    return new TrackedAsyncData(this.args.vocabulary.getTopLevelTerms());
  }

  get topLevelTerms() {
    return this.topLevelTermsData.isResolved ? this.topLevelTermsData.value : [];
  }
  <template>
    <li data-test-dashboard-selected-vocabulary>
      <h3 data-test-title>
        {{@vocabulary.title}}
      </h3>
      {{#each (sortBy "title" this.topLevelTerms) as |term|}}
        <SelectedTermTree
          @selectedTermIds={{@selectedTermIds}}
          @term={{term}}
          @add={{@add}}
          @remove={{@remove}}
        />
      {{/each}}
    </li>
  </template>
}
