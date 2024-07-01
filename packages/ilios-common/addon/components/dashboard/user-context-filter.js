import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default class DashboardUserContextFilterComponent extends Component {
  get uniqueId() {
    return guidFor(this);
  }

  @action
  toggle(context) {
    const newUserContext = context === this.args.userContext ? null : context;
    this.args.setUserContext(newUserContext);
  }
}
