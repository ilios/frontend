import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { deprecate } from '@ember/debug';
import { TrackedAsyncData } from 'ember-async-data';

export default class ValidationError extends Component {
  @cached
  get errorsForData() {
    return new TrackedAsyncData(this.args.validatable.getErrorsFor(this.args.property));
  }

  get errors() {
    if (this.args.errors) {
      deprecate(
        `Passing @errors to ValidationError is deprecated, use @errorsFor instead.`,
        false,
        {
          id: 'common.validation-error-error-arg',
          for: 'ilios-common',
          since: {
            available: '87.1.0',
            enabled: '87.1.0',
          },
          until: '88.0.0',
        },
      );
      return this.args.errors;
    }
    return this.errorsForData.isResolved ? this.errorsForData.value : [];
  }
}
