import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class DashboardSelectedVocabularyComponent extends Component {
  @cached
  get topLevelTermsData() {
    return new TrackedAsyncData(this.args.vocabulary.getTopLevelTerms());
  }

  get topLevelTerms() {
    return this.topLevelTermsData.isResolved ? this.topLevelTermsData.value : [];
  }
}

<div data-test-dashboard-selected-vocabulary>
  <h6 data-test-title>
    {{@vocabulary.title}}
  </h6>
  {{#each (sort-by "title" this.topLevelTerms) as |term|}}
    <Dashboard::SelectedTermTree
      @selectedTermIds={{@selectedTermIds}}
      @term={{term}}
      @add={{@add}}
      @remove={{@remove}}
    />
  {{/each}}
</div>