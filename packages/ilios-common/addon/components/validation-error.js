import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class ValidationError extends Component {
  @cached
  get errorsForData() {
    return new TrackedAsyncData(this.args.validatable.getErrorsFor(this.args.property));
  }

  get errors() {
    return this.errorsForData.isResolved ? this.errorsForData.value : [];
  }
}
