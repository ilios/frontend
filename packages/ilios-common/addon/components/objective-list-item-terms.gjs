import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class ObjectiveListItemTermsComponent extends Component {
  @cached
  get termsData() {
    return new TrackedAsyncData(this.args.subject.terms);
  }

  get terms() {
    return this.termsData.isResolved ? this.termsData.value : null;
  }
}
