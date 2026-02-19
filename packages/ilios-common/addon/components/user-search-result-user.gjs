import { and, not } from 'ember-truth-helpers';
import includes from 'ilios-common/helpers/includes';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import Component from '@glimmer/component';
import UserStatus from 'ilios-common/components/user-status';

export default class UserSearchResultUser extends Component {
  get canAddUser() {
    return this.args.user.enabled || this.args.canAddDisabledUser;
  }

  <template>
    {{#if (and this.canAddUser (not (includes @user @currentlyActiveUsers)))}}
      <li class="active" data-test-result>
        <button class="link-button" type="button" {{on "click" (fn @addUser @user)}}>
          <div class="name">
            {{@user.fullName}}
            <UserStatus @user={{@user}} />
          </div>
          <div class="email">
            {{@user.email}}
          </div>
        </button>
      </li>
    {{else}}
      <li class="inactive" data-test-result>
        <div class="name">
          {{@user.fullName}}
          <UserStatus @user={{@user}} />
        </div>
        <div class="email">
          {{@user.email}}
        </div>
      </li>
    {{/if}}
  </template>
}
