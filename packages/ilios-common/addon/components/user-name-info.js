import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';

export default class UserNameInfoComponent extends Component {
  @service iliosConfig;
  @tracked isHoveringOverUsernameInfo = false;

  showCampusNameOfRecordConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('showCampusNameOfRecord'),
  );

  get usernameInfoId() {
    return `user-name-info-${guidFor(this)}`;
  }

  get usernameInfoElement() {
    return document.getElementById(this.usernameInfoId);
  }

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
