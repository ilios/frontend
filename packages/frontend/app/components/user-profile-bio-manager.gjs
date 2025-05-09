import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { all } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { dropTask, timeout } from 'ember-concurrency';
import { ValidateIf } from 'class-validator';
import { validatable, IsEmail, NotBlank, Length } from 'ilios-common/decorators/validation';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import { uniqueId, fn, concat } from '@ember/helper';
import includes from 'ilios-common/helpers/includes';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import ValidationError from 'ilios-common/components/validation-error';
import not from 'ember-truth-helpers/helpers/not';
import gt from 'ember-truth-helpers/helpers/gt';
import eq from 'ember-truth-helpers/helpers/eq';

@validatable
export default class UserProfileBioManagerComponent extends Component {
  @service currentUser;
  @service iliosConfig;
  @service intl;
  @service fetch;
  @service store;

  @tracked @Length(1, 50) @NotBlank() firstName;
  @tracked @Length(0, 20) middleName;
  @tracked @Length(1, 50) @NotBlank() lastName;
  @tracked @Length(0, 16) campusId;
  @tracked @Length(0, 16) otherId;
  @tracked @IsEmail() @Length(1, 100) @NotBlank() email;
  @tracked @Length(0, 200) displayName;
  @tracked @Length(0, 50) pronouns;
  @tracked @IsEmail() @Length(0, 100) preferredEmail;
  @tracked @Length(0, 20) phone;
  @tracked
  @Length(1, 100)
  @NotBlank()
  username;
  @tracked
  @ValidateIf((o) => o.args.canEditUsernameAndPassword && o.changeUserPassword)
  @Length(5)
  @NotBlank()
  password;

  @tracked updatedFieldsFromSync = [];
  @tracked showSyncErrorMessage = false;
  @tracked showUsernameTakenErrorMessage = false;
  @tracked changeUserPassword = false;
  @tracked passwordStrengthScore = 0;

  constructor() {
    super(...arguments);

    const user = this.args.user;

    this.firstName = user.firstName;
    this.middleName = user.middleName;
    this.lastName = user.lastName;
    this.campusId = user.campusId;
    this.otherId = user.otherId;
    this.email = user.email;
    this.displayName = user.displayName;
    this.pronouns = user.pronouns;
    this.preferredEmail = user.preferredEmail;
    this.phone = user.phone;

    if (this.args.userAuthentication) {
      this.username = this.args.userAuthentication.username;
      this.password = '';
    } else {
      this.username = user.username;
      this.password = user.password;
    }
  }

  @cached
  get hasErrorForPasswordData() {
    return new TrackedAsyncData(this.hasErrorFor('password'));
  }
  get hasErrorForPassword() {
    return this.hasErrorForPasswordData.isResolved ? this.hasErrorForPasswordData.value : false;
  }

  async calculatePasswordStrengthScore() {
    const { default: zxcvbn } = await import('zxcvbn');
    const password = isEmpty(this.password) ? '' : this.password;
    const obj = zxcvbn(password);
    this.passwordStrengthScore = obj.score;
  }

  async isUsernameTaken(username, userId) {
    const auths = await this.store.query('authentication', {
      filters: { username },
    });
    return auths.some((auth) => auth.belongsTo('user').id() !== userId);
  }

  @action
  cancelChangeUserPassword() {
    this.changeUserPassword = false;
    this.password = null;
    this.passwordStrengthScore = 0;
    this.removeErrorDisplayFor('password');
  }

  @action
  keyboard(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if (13 === keyCode) {
      this.save.perform();
      return;
    }

    if (27 === keyCode) {
      if ('text' === target.type) {
        this.cancel();
      } else {
        this.cancelChangeUserPassword();
      }
    }
  }

  @action
  cancel() {
    this.password = null;
    this.passwordStrengthScore = 0;
    this.changeUserPassword = false;
    this.updatedFieldsFromSync = [];
    this.showUsernameTakenErrorMessage = false;
    this.args.setIsManaging(false);
  }

  @action
  async setPassword(password) {
    this.password = password;
    await this.calculatePasswordStrengthScore();
  }

  save = dropTask(async () => {
    const store = this.store;
    this.addErrorDisplaysFor([
      'firstName',
      'middleName',
      'lastName',
      'campusId',
      'otherId',
      'email',
      'displayName',
      'pronouns',
      'preferredEmail',
      'phone',
      'username',
      'password',
    ]);
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }

    const isUsernameTaken = await this.isUsernameTaken(this.username, this.args.user.id);
    if (isUsernameTaken) {
      this.clearErrorDisplay();
      this.showUsernameTakenErrorMessage = true;
      return false;
    }

    const user = this.args.user;
    user.set('firstName', this.firstName);
    user.set('middleName', this.middleName);
    user.set('lastName', this.lastName);
    user.set('campusId', this.campusId);
    user.set('otherId', this.otherId);
    user.set('email', this.email);
    user.set('displayName', this.displayName);
    user.set('pronouns', this.pronouns);
    user.set('preferredEmail', this.preferredEmail);
    user.set('phone', this.phone);

    let auth = await user.authentication;
    if (!auth) {
      auth = store.createRecord('authentication', {
        user,
      });
    }
    //always set and send the username in case it was updated in the sync
    let username = this.username;
    if (isEmpty(username)) {
      username = null;
    }
    auth.set('username', username);
    if (this.args.canEditUsernameAndPassword && this.changeUserPassword) {
      auth.set('password', this.password);
    }
    await auth.save();
    await user.save();
    const pendingUpdates = await user.pendingUserUpdates;
    await all(pendingUpdates.map((update) => update.destroyRecord()));
    this.clearErrorDisplay();
    this.hasSavedRecently = true;
    await timeout(500);
    this.hasSavedRecently = false;
    this.cancel();
  });

  directorySync = dropTask(async () => {
    this.updatedFieldsFromSync = [];
    this.showSyncErrorMessage = false;
    const userId = this.args.user.id;
    const url = `/application/directory/find/${userId}`;
    try {
      const data = await this.fetch.getJsonFromApiHost(url);
      const userData = data.result;
      const firstName = this.firstName;
      const lastName = this.lastName;
      const campusId = this.campusId;
      const email = this.email;
      const displayName = this.displayName;
      const pronouns = this.pronouns;
      const phone = this.phone;
      const username = this.username;
      if (userData.firstName !== firstName) {
        this.firstName = userData.firstName;
        this.updatedFieldsFromSync = [...this.updatedFieldsFromSync, 'firstName'];
      }
      if (userData.lastName !== lastName) {
        this.lastName = userData.lastName;
        this.updatedFieldsFromSync = [...this.updatedFieldsFromSync, 'lastName'];
      }
      if (userData.displayName !== displayName) {
        this.displayName = userData.displayName;
        this.updatedFieldsFromSync = [...this.updatedFieldsFromSync, 'displayName'];
      }
      if (userData.pronouns !== pronouns) {
        this.pronouns = userData.pronouns;
        this.updatedFieldsFromSync = [...this.updatedFieldsFromSync, 'pronouns'];
      }
      if (userData.email !== email) {
        this.email = userData.email;
        this.updatedFieldsFromSync = [...this.updatedFieldsFromSync, 'email'];
      }

      if (userData.campusId !== campusId) {
        this.campusId = userData.campusId;
        this.updatedFieldsFromSync = [...this.updatedFieldsFromSync, 'campusId'];
      }
      if (userData.phone !== phone) {
        this.phone = userData.phone;
        this.updatedFieldsFromSync = [...this.updatedFieldsFromSync, 'phone'];
      }
      if (userData.username !== username) {
        this.username = userData.username;
        this.updatedFieldsFromSync = [...this.updatedFieldsFromSync, 'username'];
      }
    } catch {
      this.showSyncErrorMessage = true;
    }
  });
  <template>
    <div class="user-profile-bio-manager" data-test-user-profile-bio-manager ...attributes>
      <div class="actions">
        <button
          aria-label={{t "general.save"}}
          type="button"
          class="bigadd"
          {{on "click" (perform this.save)}}
          data-test-save
        >
          <FaIcon
            @icon={{if this.save.isRunning "spinner" "check"}}
            @spin={{if this.save.isRunning true false}}
          />
        </button>
        <button
          aria-label={{t "general.cancel"}}
          type="button"
          disabled={{this.save.isRunning}}
          class="bigcancel"
          {{on "click" this.cancel}}
          data-test-cancel
        >
          <FaIcon @icon="arrow-rotate-left" />
        </button>
      </div>

      {{#unless @userAuthentication.username}}
        <div class="error" data-test-username-missing>
          {{t "general.missingRequiredUsername"}}
        </div>
      {{/unless}}

      <p class="primary-school" data-test-school>
        <strong>
          {{t "general.primarySchool"}}:
        </strong>
        {{@user.school.title}}
      </p>

      {{#let (uniqueId) as |templateId|}}
        <div class="form">
          <div
            class="item{{if
                (includes 'firstName' this.updatedFieldsFromSync)
                ' synced-from-directory'
              }}"
            data-test-firstname
          >
            <label for="firstname-{{templateId}}">
              {{t "general.firstName"}}:
            </label>
            <input
              id="firstname-{{templateId}}"
              type="text"
              value={{this.firstName}}
              {{on "input" (pick "target.value" (set this "firstName"))}}
              {{on "keyup" (fn this.addErrorDisplayFor "firstName")}}
              {{on "keyup" this.keyboard}}
              data-test-first-name-input
            />
            <ValidationError @validatable={{this}} @property="firstName" />
          </div>
          <div class="item" data-test-middlename>
            <label for="middlename-{{templateId}}">
              {{t "general.middleName"}}:
            </label>
            <input
              id="middlename-{{templateId}}"
              type="text"
              value={{this.middleName}}
              {{on "input" (pick "target.value" (set this "middleName"))}}
              {{on "keyup" (fn this.addErrorDisplayFor "middleName")}}
              {{on "keyup" this.keyboard}}
              data-test-middle-name-input
            />
            <ValidationError @validatable={{this}} @property="middleName" />
          </div>
          <div
            class="item{{if
                (includes 'lastName' this.updatedFieldsFromSync)
                ' synced-from-directory'
              }}"
            data-test-lastname
          >
            <label for="lastname-{{templateId}}">
              {{t "general.lastName"}}:
            </label>
            <input
              id="lastname-{{templateId}}"
              type="text"
              value={{this.lastName}}
              {{on "input" (pick "target.value" (set this "lastName"))}}
              {{on "keyup" (fn this.addErrorDisplayFor "lastName")}}
              {{on "keyup" this.keyboard}}
              data-test-last-name-input
            />
            <ValidationError @validatable={{this}} @property="lastName" />
          </div>
          <div
            class="item campus-id{{if
                (includes 'campusId' this.updatedFieldsFromSync)
                ' synced-from-directory'
              }}"
            data-test-campus-id
          >
            <label for="campus-id-{{templateId}}">
              {{t "general.campusId"}}:
            </label>
            <div class="campus-id-controls">
              <input
                id="campus-id-{{templateId}}"
                type="text"
                value={{this.campusId}}
                {{on "input" (pick "target.value" (set this "campusId"))}}
                {{on "keyup" (fn this.addErrorDisplayFor "campusId")}}
                {{on "keyup" this.keyboard}}
                data-test-campus-id-input
              />
              {{#unless @canEditUsernameAndPassword}}
                <button
                  type="button"
                  class="directory-sync"
                  title={{t "general.updateUserFromDirectory"}}
                  disabled={{this.directorySync.isRunning}}
                  {{on "click" (perform this.directorySync)}}
                  data-test-directory-sync
                >
                  <FaIcon
                    @icon={{if this.directorySync.isRunning "spinner" "rotate"}}
                    @spin={{this.directorySync.isRunning}}
                  />
                </button>
              {{/unless}}
              <ValidationError @validatable={{this}} @property="campusId" />
            </div>
            {{#if this.showSyncErrorMessage}}
              <span class="validation-error-message" data-test-sync-error>
                {{t "general.unableToSyncUser"}}
              </span>
            {{/if}}
          </div>
          <div class="item" data-test-other-id>
            <label for="other-id-{{templateId}}">
              {{t "general.otherId"}}:
            </label>
            <input
              id="other-id-{{templateId}}"
              type="text"
              value={{this.otherId}}
              {{on "input" (pick "target.value" (set this "otherId"))}}
              {{on "keyup" (fn this.addErrorDisplayFor "otherId")}}
              {{on "keyup" this.keyboard}}
              data-test-other-id-input
            />
            <ValidationError @validatable={{this}} @property="otherId" />
          </div>
          <div
            class="item{{if
                (includes 'email' this.updatedFieldsFromSync)
                ' synced-from-directory'
              }}"
            data-test-email
          >
            <label for="email-{{templateId}}">
              {{t "general.email"}}:
            </label>
            <input
              id="email-{{templateId}}"
              type="text"
              value={{this.email}}
              {{on "input" (pick "target.value" (set this "email"))}}
              {{on "keyup" (fn this.addErrorDisplayFor "email")}}
              {{on "keyup" this.keyboard}}
              data-test-email-input
            />
            <ValidationError @validatable={{this}} @property="email" />
          </div>
          <div
            class="item{{if
                (includes 'displayName' this.updatedFieldsFromSync)
                ' synced-from-directory'
              }}"
            data-test-displayname
          >
            <label for="displayname-{{templateId}}">
              {{t "general.displayName"}}:
            </label>
            <input
              id="displayname-{{templateId}}"
              type="text"
              value={{this.displayName}}
              {{on "input" (pick "target.value" (set this "displayName"))}}
              {{on "keyup" (fn this.addErrorDisplayFor "displayName")}}
              {{on "keyup" this.keyboard}}
              data-test-display-name-input
            />
            <ValidationError @validatable={{this}} @property="displayName" />
          </div>
          <div
            class="item{{if
                (includes 'pronouns' this.updatedFieldsFromSync)
                ' synced-from-directory'
              }}"
            data-test-pronouns
          >
            <label for="pronouns-{{templateId}}">
              {{t "general.pronouns"}}:
            </label>
            <input
              id="pronouns-{{templateId}}"
              type="text"
              value={{this.pronouns}}
              {{on "input" (pick "target.value" (set this "pronouns"))}}
              {{on "keyup" (fn this.addErrorDisplayFor "pronouns")}}
              {{on "keyup" this.keyboard}}
              data-test-pronouns-input
            />
            <ValidationError @validatable={{this}} @property="pronouns" />
          </div>
          <div
            class="item{{if
                (includes 'preferredEmail' this.updatedFieldsFromSync)
                ' synced-from-directory'
              }}"
            data-test-preferred-email
          >
            <label for="preferred-email-{{templateId}}">
              {{t "general.preferredEmail"}}:
            </label>
            <input
              id="preferred-email-{{templateId}}"
              type="text"
              value={{this.preferredEmail}}
              {{on "input" (pick "target.value" (set this "preferredEmail"))}}
              {{on "keyup" (fn this.addErrorDisplayFor "preferredEmail")}}
              {{on "keyup" this.keyboard}}
              data-test-preferred-email-input
            />
            <ValidationError @validatable={{this}} @property="preferredEmail" />
          </div>
          <div
            class="item{{if
                (includes 'phone' this.updatedFieldsFromSync)
                ' synced-from-directory'
              }}"
            data-test-phone
          >
            <label for="phone-{{templateId}}">
              {{t "general.phone"}}:
            </label>
            <input
              id="phone-{{templateId}}"
              type="text"
              value={{this.phone}}
              {{on "input" (pick "target.value" (set this "phone"))}}
              {{on "keyup" (fn this.addErrorDisplayFor "phone")}}
              {{on "keyup" this.keyboard}}
              data-test-phone-input
            />
            <ValidationError @validatable={{this}} @property="phone" />
          </div>
          <div
            class="item{{if
                (includes 'username' this.updatedFieldsFromSync)
                ' synced-from-directory'
              }}"
            data-test-username
          >
            <label for="username-{{templateId}}">
              {{t "general.username"}}:
            </label>
            <input
              id="username-{{templateId}}"
              type="text"
              value={{this.username}}
              {{on "input" (pick "target.value" (set this "username"))}}
              {{on "input" (set this "showUsernameTakenErrorMessage" false)}}
              {{on "keyup" (fn this.addErrorDisplayFor "username")}}
              {{on "keyup" this.keyboard}}
              disabled={{not @canEditUsernameAndPassword}}
              data-test-username-input
            />
            <ValidationError @validatable={{this}} @property="username" />
            {{#if this.showUsernameTakenErrorMessage}}
              <span class="validation-error-message" data-test-duplicate-username>
                {{t "errors.duplicateUsername"}}
              </span>
            {{/if}}
          </div>
          {{#if @canEditUsernameAndPassword}}
            <div class="item password" data-test-password>
              <label for="password-{{templateId}}">
                {{t "general.password"}}:
              </label>
              {{#if this.changeUserPassword}}
                <input
                  id="password-{{templateId}}"
                  type="password"
                  value={{this.password}}
                  {{on "input" (pick "target.value" this.setPassword)}}
                  {{on "keyup" (fn this.addErrorDisplayFor "password")}}
                  {{on "keyup" this.keyboard}}
                  data-test-password-input
                />
                {{#if this.hasErrorForPassword}}
                  <ValidationError @validatable={{this}} @property="password" />
                {{else if (gt this.password.length 0)}}
                  <span
                    class="password-strength {{concat 'strength-' this.passwordStrengthScore}}"
                    data-test-password-strength-text
                  >
                    {{#if (eq this.passwordStrengthScore 0)}}
                      {{t "general.tryHarder"}}
                    {{else if (eq this.passwordStrengthScore 1)}}
                      {{t "general.bad"}}
                    {{else if (eq this.passwordStrengthScore 2)}}
                      {{t "general.weak"}}
                    {{else if (eq this.passwordStrengthScore 3)}}
                      {{t "general.good"}}
                    {{else if (eq this.passwordStrengthScore 4)}}
                      {{t "general.strong"}}
                    {{/if}}
                  </span>
                  <meter
                    max="4"
                    value={{this.passwordStrengthScore}}
                    data-test-password-strength-meter
                  ></meter>
                {{/if}}
                <button
                  class="link-button cancel-password-field"
                  type="button"
                  {{on "click" this.cancelChangeUserPassword}}
                  data-test-password-cancel
                >
                  {{t "general.cancel"}}
                </button>
              {{else}}
                <button
                  class="link-button activate-password-field"
                  type="button"
                  {{on "click" (set this "changeUserPassword" true)}}
                  data-test-change-password
                >
                  {{t "general.modifyUserPassword"}}
                </button>
              {{/if}}
            </div>
          {{/if}}
        </div>
      {{/let}}
    </div>
  </template>
}
