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

<span class="user-name-info" data-test-user-name-info ...attributes>
  <span data-test-fullname>{{@user.fullName}}</span>
  {{#if @user.pronouns}}
    <span data-test-pronouns>({{@user.pronouns}})</span>
  {{/if}}
  {{#if (and this.showCampusNameOfRecord @user.hasDifferentDisplayName)}}
    <span
      data-test-info
      id={{this.usernameInfoId}}
      {{mouse-hover-toggle this.toggleUsernameInfoHover}}
    >
      <FaIcon @icon="circle-info" aria-label={{t "general.campusNameOfRecord"}} class="info" />
      {{#if this.isHoveringOverUsernameInfo}}
        <IliosTooltip @target={{this.usernameInfoElement}}>
          <strong>{{t "general.campusNameOfRecord"}}:</strong>
          {{@user.fullNameFromFirstMiddleLastName}}
        </IliosTooltip>
      {{/if}}
    </span>
  {{/if}}
</span>