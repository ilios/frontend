import Component from '@glimmer/component';
import ResolveAsyncValue from '../classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

export default class SessionOfferingsComponent extends Component {
  @use course = new ResolveAsyncValue(() => [this.args.session.course]);
  @use courseStartDate = new ResolveAsyncValue(() => [this.course?.startDate]);
  @use courseEndDate = new ResolveAsyncValue(() => [this.course?.endDate]);
  @use cohorts = new ResolveAsyncValue(() => [this.course?.cohorts]);
}
