import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { modifier } from 'ember-modifier';
import t from 'ember-intl/helpers/t';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import UserProfileBioDetails from 'frontend/components/user-profile-bio-details';
import UserProfileBioManager from 'frontend/components/user-profile-bio-manager';

export default class UserProfileBioComponent extends Component {
  @service currentUser;
  @service iliosConfig;
  @service intl;
  @service fetch;
  @service store;

  @tracked hasSavedRecently = false;

  getAuthUser = modifier((element, [userAuthentication]) => {
    if (userAuthentication) {
      this.args.user.username = userAuthentication.username;
      this.args.user.password = '';
    }
  });

  @cached
  get userSearchTypeData() {
    return new TrackedAsyncData(this.iliosConfig.getUserSearchType());
  }
  get userSearchType() {
    return this.userSearchTypeData.isResolved ? this.userSearchTypeData.value : null;
  }

  @cached
  get userAuthenticationData() {
    return new TrackedAsyncData(this.args.user.authentication);
  }

  get userAuthentication() {
    return this.userAuthenticationData.isResolved ? this.userAuthenticationData.value : null;
  }

  get canEditUsernameAndPassword() {
    if (!this.userSearchType) {
      return false;
    }
    return this.userSearchType !== 'ldap';
  }
  <template>
    {{#if this.userAuthenticationData.isResolved}}
      <div
        class="user-profile-bio small-component{{if
            this.hasSavedRecently
            ' has-saved'
            ' has-not-saved'
          }}"
        {{this.getAuthUser this.userAuthentication}}
        data-test-user-profile-bio
        ...attributes
      >
        {{#unless this.userAuthentication.username}}
          <div class="error" data-test-username-missing>
            {{t "general.missingRequiredUsername"}}
          </div>
        {{/unless}}

        {{#if @isManaging}}
          <UserProfileBioManager
            @user={{@user}}
            @userAuthentication={{this.userAuthentication}}
            @setIsManaging={{@setIsManaging}}
            @canEditUsernameAndPassword={{this.canEditUsernameAndPassword}}
          />
        {{else}}
          <UserProfileBioDetails
            @user={{@user}}
            @userAuthentication={{this.userAuthentication}}
            @isManageable={{@isManageable}}
            @setIsManaging={{@setIsManaging}}
            @canEditUsernameAndPassword={{this.canEditUsernameAndPassword}}
          />
        {{/if}}
      </div>
    {{else}}
      <LoadingSpinner />
    {{/if}}
  </template>
}
