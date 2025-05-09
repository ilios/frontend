import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import and from 'ember-truth-helpers/helpers/and';
import mouseHoverToggle from 'ilios-common/modifiers/mouse-hover-toggle';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import IliosTooltip from 'ilios-common/components/ilios-tooltip';

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
  <template>
    <span class="user-name-info" data-test-user-name-info ...attributes>
      <span data-test-fullname>{{@user.fullName}}</span>
      {{#if @user.pronouns}}
        <span data-test-pronouns>({{@user.pronouns}})</span>
      {{/if}}
      {{#if (and this.showCampusNameOfRecord @user.hasDifferentDisplayName)}}
        <span
          data-test-info
          id={{this.usernameInfoId}}
          {{mouseHoverToggle this.toggleUsernameInfoHover}}
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
  </template>
}
