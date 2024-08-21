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
