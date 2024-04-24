import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';

export default class UserNameInfoComponent extends Component {
  @service iliosConfig;
  @tracked isHoveringOverUsernameInfo = false;
  @tracked element;

  showCampusNameOfRecordConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('showCampusNameOfRecord'),
  );
  get showCampusNameOfRecord() {
    return this.showCampusNameOfRecordConfig.isResolved
      ? this.showCampusNameOfRecordConfig.value
      : false;
  }

  @action
  toggleUsernameInfoHover(isHovering) {
    this.isHoveringOverUsernameInfo = isHovering;
  }
}
