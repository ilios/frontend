import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class UserNameInfoComponent extends Component {
  @tracked isHoveringOverUsernameInfo = false;
  @tracked fullName;
  @tracked campusNameOfRecord;
  @tracked hasDifferentCampusNameOfRecord = false;

  @action
  load(){
    if (!this.args.user) {
      return false;
    }
    this.fullName = this.args.user.get('fullName');
    this.hasDifferentCampusNameOfRecord = this.args.user.get('hasDifferentDisplayName');
    this.campusNameOfRecord = this.args.user.get('fullNameFromFirstMiddleLastName');
  }

  @action
  toggleUsernameInfoHover(isHovering) {
    this.isHoveringOverUsernameInfo = isHovering;
  }
}
