import Component from '@glimmer/component';
import { service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';
import { tracked, cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { findBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import eq from 'ember-truth-helpers/helpers/eq';
import YesNo from 'frontend/components/yes-no';

export default class UserProfileRolesComponent extends Component {
  @service store;
  @service currentUser;
  @tracked hasSavedRecently = false;
  @tracked isEnabledFlipped = false;
  @tracked isFormerStudentFlipped = false;
  @tracked isStudentFlipped = false;
  @tracked isUserSyncIgnoredFlipped = false;

  @cached
  get roleTitlesData() {
    return new TrackedAsyncData(this.args.user.roles);
  }

  get roleTitles() {
    return this.roleTitlesData.isResolved
      ? this.roleTitlesData.value.map((role) => role.title.toLowerCase())
      : [];
  }

  get isStudent() {
    const originallyYes = this.roleTitles.includes('student');
    return (originallyYes && !this.isStudentFlipped) || (!originallyYes && this.isStudentFlipped);
  }

  get isFormerStudent() {
    const originallyYes = this.roleTitles.includes('former student');
    return (
      (originallyYes && !this.isFormerStudentFlipped) ||
      (!originallyYes && this.isFormerStudentFlipped)
    );
  }

  get isEnabled() {
    const originallyYes = this.args.user.get('enabled');
    return (originallyYes && !this.isEnabledFlipped) || (!originallyYes && this.isEnabledFlipped);
  }

  get isUserSyncIgnored() {
    const originallyYes = this.args.user.get('userSyncIgnore');
    return (
      (originallyYes && !this.isUserSyncIgnoredFlipped) ||
      (!originallyYes && this.isUserSyncIgnoredFlipped)
    );
  }
  @action
  cancel() {
    this.resetFlipped();
    if (this.args.setIsManaging) {
      this.args.setIsManaging(false);
    }
  }

  resetFlipped() {
    this.isStudentFlipped = false;
    this.isFormerStudentFlipped = false;
    this.isEnabledFlipped = false;
    this.isUserSyncIgnoredFlipped = false;
  }

  save = dropTask(async () => {
    const roles = await this.store.findAll('user-role');
    const studentRole = findBy(roles, 'title', 'Student');
    const formerStudentRole = findBy(roles, 'title', 'Former Student');
    this.args.user.set('enabled', this.isEnabled);
    this.args.user.set('userSyncIgnore', this.isUserSyncIgnored);
    const userRoles = [];
    if (this.isStudent) {
      userRoles.push(studentRole);
    }
    if (this.isFormerStudent) {
      userRoles.push(formerStudentRole);
    }
    this.args.user.set('roles', userRoles);
    this.resetFlipped();
    await this.args.user.save();
    if (this.args.setIsManaging) {
      this.args.setIsManaging(false);
    }
    this.hasSavedRecently = true;
    await timeout(500);
    this.hasSavedRecently = false;
  });
  <template>
    <div
      class="user-profile-roles small-component last
        {{if this.hasSavedRecently 'has-saved' 'has-not-saved'}}"
      data-test-user-profile-roles
      ...attributes
    >
      <div class="actions">
        {{#if @isManaging}}
          <button
            type="button"
            class="bigadd"
            data-test-save
            aria-label={{t "general.save"}}
            {{on "click" (perform this.save)}}
          >
            <FaIcon
              @icon={{if this.save.isRunning "spinner" "check"}}
              @spin={{this.save.isRunning}}
            />
          </button>
          <button
            type="button"
            disabled={{this.save.isRunning}}
            class="bigcancel"
            aria-label={{t "general.cancel"}}
            {{on "click" this.cancel}}
          >
            <FaIcon @icon="arrow-rotate-left" />
          </button>
        {{else if @isManageable}}
          <button
            aria-label={{t "general.manage"}}
            type="button"
            class="manage"
            data-test-manage
            {{on "click" (fn @setIsManaging true)}}
          >
            <FaIcon @icon="pen-to-square" />
          </button>
        {{/if}}
      </div>
      <div class="form">
        <div class="item" data-test-student>
          <label>
            {{t "general.student"}}:
          </label>
          <span class="value {{if this.isStudent 'yes' 'no'}}">
            {{#if this.isStudent}}
              {{t "general.yes"}}
            {{else}}
              {{t "general.no"}}
            {{/if}}
          </span>
        </div>
        <div class="item" data-test-former-student>
          <label for="former-student">
            {{t "general.formerStudent"}}:
          </label>
          {{#if @isManaging}}
            <input
              id="former-student"
              type="checkbox"
              checked={{this.isFormerStudent}}
              {{on "click" (set this "isFormerStudentFlipped" (not this.isFormerStudentFlipped))}}
            />
          {{else}}
            <span class="value {{if this.isFormerStudent 'yes' 'no'}}">
              {{#if this.isFormerStudent}}
                {{t "general.yes"}}
              {{else}}
                {{t "general.no"}}
              {{/if}}
            </span>
          {{/if}}
        </div>
        <hr />
        <div class="item" data-test-enabled>
          <label for="is-enabled">
            {{t "general.accountEnabled"}}:
          </label>
          {{#if @isManaging}}
            <input
              id="is-enabled"
              type="checkbox"
              checked={{this.isEnabled}}
              {{on "click" (set this "isEnabledFlipped" (not this.isEnabledFlipped))}}
              disabled={{if (eq @user.id this.currentUser.currentUserId) true}}
            />
          {{else}}
            <span class="value {{if this.isEnabled 'yes' 'no'}}">
              {{#if this.isEnabled}}
                {{t "general.yes"}}
              {{else}}
                {{t "general.no"}}
              {{/if}}
            </span>
          {{/if}}
        </div>
        <div class="item" data-test-exclude-from-sync>
          <label for="exclude-from-sync">
            {{t "general.excludeFromSync"}}:
          </label>
          {{#if @isManaging}}
            <input
              id="exclude-from-sync"
              type="checkbox"
              checked={{this.isUserSyncIgnored}}
              {{on
                "click"
                (set this "isUserSyncIgnoredFlipped" (not this.isUserSyncIgnoredFlipped))
              }}
            />
          {{else}}
            <span class="value {{if this.isUserSyncIgnored 'yes' 'no'}}">
              {{#if this.isUserSyncIgnored}}
                {{t "general.yes"}}
              {{else}}
                {{t "general.no"}}
              {{/if}}
            </span>
          {{/if}}
        </div>
        <hr />
        <div class="item" data-test-performs-non-learner-function>
          <label>
            {{t "general.performsNonLearnerFunctions"}}:
          </label>
          <YesNo @value={{@user.performsNonLearnerFunction}} />
        </div>
        <div class="item" data-test-learner>
          <label>
            {{t "general.learner"}}:
          </label>
          <YesNo @value={{@user.isLearner}} />
        </div>
        <hr />
        <div class="item" data-test-root>
          <label>
            {{t "general.root"}}:
          </label>
          <YesNo @value={{@user.root}} />
        </div>
      </div>
    </div>
  </template>
}
