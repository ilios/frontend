import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class UserNameInfoComponent extends Component {
  @tracked isHoveringOverUsernameInfo = false;
  @tracked element;

  @action
  toggleUsernameInfoHover(isHovering) {
    this.isHoveringOverUsernameInfo = isHovering;
  }
}
