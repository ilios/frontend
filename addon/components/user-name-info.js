import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class UserNameInfoComponent extends Component {
  @tracked isHoveringOverUsernameInfo = false;
  @tracked fullName;
  @tracked campusNameOfRecord;
  @tracked hasDifferentCampusNameOfRecord = false;

  @action
  load(element, [user]){
    if (! user) {
      return;
    }
    this.fullName = user.get('fullName');
    this.hasDifferentCampusNameOfRecord = user.get('hasDifferentDisplayName');
    this.campusNameOfRecord = user.get('fullNameFromFirstMiddleLastName');
  }

  @action
  toggleUsernameInfoHover(isHovering) {
    this.isHoveringOverUsernameInfo = isHovering;
  }
}
