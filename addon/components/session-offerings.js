import Component from '@glimmer/component';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

export default class SessionOfferingsComponent extends Component {
  @use course = new ResolveAsyncValue(() => [this.args.session.course]);
  @use cohorts = new ResolveAsyncValue(() => [this.course?.cohorts]);
}
