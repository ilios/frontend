import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default class DashboardMaterialListItemComponent extends Component {
  get uniqueId() {
    return guidFor(this);
  }

  @action
  sortString(a, b) {
    return a.localeCompare(b);
  }
}
