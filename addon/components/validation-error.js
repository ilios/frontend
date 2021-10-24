import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class ValidationErrorComponent extends Component {
  @use errors = new ResolveAsyncValue(() => [this.args.errors, []]);
}
