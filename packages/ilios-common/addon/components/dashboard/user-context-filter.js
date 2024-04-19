import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class DashboardUserContextFilterComponent extends Component {
  @action
  toggle() {
    const newUserContext = 'instructor' === this.args.userContext ? null : 'instructor';
    this.args.setUserContext(newUserContext);
  }
}
