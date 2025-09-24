import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { all } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import { uniqueId, concat } from '@ember/helper';
import includes from 'ilios-common/helpers/includes';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import eq from 'ember-truth-helpers/helpers/eq';
import YupValidations from 'ilios-common/classes/yup-validations';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import { string } from 'yup';
import isEmail from 'validator/lib/isEmail';

export default class UserProfileBioManagerComponent extends Component {
  @service currentUser;
  @service iliosConfig;
  @service intl;
  @service fetch;
  @service store;

  @tracked firstName;
  @tracked middleName;
  @tracked lastName;
  @tracked campusId;
  @tracked otherId;
  @tracked email;
  @tracked displayName;
  @tracked pronouns;
  @tracked preferredEmail;
  @tracked phone;
  @tracked username;
  @tracked password;
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

  validations = new YupValidations(this, {
    firstName: string().ensure().trim().required().max(50),
    middleName: string().ensure().trim().max(20),
    lastName: string().ensure().trim().required().max(50),
    campusId: string().ensure().trim().max(16),
    otherId: string().ensure().trim().max(16),
    email: string()
      .ensure()
      .trim()
      .required()
      .max(100)
      .test('email', this.validateEmailMessage, this.validateEmail),
    displayName: string().ensure().trim().max(200),
    pronouns: string().ensure().trim().max(50),
    preferredEmail: string()
      .ensure()
      .trim()
      .max(100)
      .test('preferred-email', this.validateEmailMessage, this.validateEmail),
    phone: string().ensure().trim().max(20),
    username: string()
      .ensure()
      .trim()
      .required()
      .max(100)
      .test(
        'username-uniqueness',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.duplicateUsername',
          };
        },
        async (value) => {
          const auths = await this.store.query('authentication', {
            filters: { username: value },
          });
          return !auths.some((auth) => auth.belongsTo('user').id() !== this.args.user.id);
        },
      ),
    password: string().when(['$args.canEditUsernameAndPassword', '$changeUserPassword'], {
      is: true,
      // the password cannot be a blank string (after trimming) and has to be at least 5 characters long.
      then: (schema) =>
        schema
          .ensure()
          .test(
            'blank-password',
            (d) => {
              return {
                path: d.path,
                messageKey: 'errors.empty',
              };
            },
            (value) => '' !== value.trim(),
          )
          .min(5),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  get checkPasswordStrength() {
    // The password is eligible for a strength check if it is not a blank string (after trimming),
    // and if its length is at least 5 characters.
    return '' !== this.password?.trim() && this.password?.length >= 5;
  }

  validateEmail(value) {
    // short-circuit on empty input - this is being caught by `required()` already.
    // that way, we don't end up with two separate validation errors on empty input.
    if ('' === value) {
      return true;
    }
    // Yup's email validation is misaligned with our backend counterpart.
    // See https://github.com/jquense/yup?tab=readme-ov-file#stringemailmessage-string--function-schema
    // So we'll continue using the email validation provided by validator.js.
    return isEmail(value);
  }

  validateEmailMessage(d) {
    return {
      path: d.path,
      messageKey: 'errors.email',
    };
  }

  async calculatePasswordStrengthScore() {
    const { default: zxcvbn } = await import('zxcvbn');
    const password = isEmpty(this.password) ? '' : this.password;
    const obj = zxcvbn(password);
    this.passwordStrengthScore = obj.score;
  }

  @action
  cancelChangeUserPassword() {
    this.changeUserPassword = false;
    this.password = null;
    this.passwordStrengthScore = 0;
    this.validations.removeErrorDisplayFor('password');
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

  save = task({ drop: true }, async () => {
    const store = this.store;
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();

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
    await timeout(500);
    this.cancel();
  });

  directorySync = task({ drop: true }, async () => {
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
              {{on "keyup" this.keyboard}}
              {{this.validations.attach "firstName"}}
              data-test-firstname-input
            />
            <YupValidationMessage
              @description={{t "general.firstName"}}
              @validationErrors={{this.validations.errors.firstName}}
              data-test-firstname-validation-error-message
            />
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
              {{on "keyup" this.keyboard}}
              {{this.validations.attach "middleName"}}
              data-test-middlename-input
            />
            <YupValidationMessage
              @description={{t "general.middleName"}}
              @validationErrors={{this.validations.errors.middleName}}
              data-test-middlename-validation-error-message
            />
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
              {{on "keyup" this.keyboard}}
              {{this.validations.attach "lastName"}}
              data-test-lastname-input
            />
            <YupValidationMessage
              @description={{t "general.lastName"}}
              @validationErrors={{this.validations.errors.lastName}}
              data-test-lastname-validation-error-message
            />
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
                {{on "keyup" this.keyboard}}
                {{this.validations.attach "campusId"}}
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
              <YupValidationMessage
                @description={{t "general.campusId"}}
                @validationErrors={{this.validations.errors.campusId}}
                data-test-campus-id-validation-error-message
              />
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
              {{on "keyup" this.keyboard}}
              {{this.validations.attach "otherId"}}
              data-test-other-id-input
            />
            <YupValidationMessage
              @description={{t "general.otherId"}}
              @validationErrors={{this.validations.errors.otherId}}
              data-test-other-id-validation-error-message
            />
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
              {{on "keyup" this.keyboard}}
              {{this.validations.attach "email"}}
              data-test-email-input
            />
            <YupValidationMessage
              @description={{t "general.email"}}
              @validationErrors={{this.validations.errors.email}}
              data-test-email-validation-error-message
            />
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
              {{on "keyup" this.keyboard}}
              {{this.validations.attach "displayName"}}
              data-test-displayname-input
            />
            <YupValidationMessage
              @description={{t "general.displayName"}}
              @validationErrors={{this.validations.errors.displayName}}
              data-test-displayname-validation-error-message
            />
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
              {{on "keyup" this.keyboard}}
              {{this.validations.attach "pronouns"}}
              data-test-pronouns-input
            />
            <YupValidationMessage
              @description={{t "general.pronouns"}}
              @validationErrors={{this.validations.errors.pronouns}}
              data-test-pronouns-validation-error-message
            />
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
              {{on "keyup" this.keyboard}}
              {{this.validations.attach "preferredEmail"}}
              data-test-preferred-email-input
            />
            <YupValidationMessage
              @description={{t "general.preferredEmail"}}
              @validationErrors={{this.validations.errors.preferredEmail}}
              data-test-preferred-email-validation-error-message
            />
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
              {{on "keyup" this.keyboard}}
              {{this.validations.attach "phone"}}
              data-test-phone-input
            />
            <YupValidationMessage
              @description={{t "general.phone"}}
              @validationErrors={{this.validations.errors.phone}}
              data-test-phone-validation-error-message
            />
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
              {{on "keyup" this.keyboard}}
              {{this.validations.attach "username"}}
              disabled={{not @canEditUsernameAndPassword}}
              data-test-username-input
            />
            <YupValidationMessage
              @description={{t "general.username"}}
              @validationErrors={{this.validations.errors.username}}
              data-test-username-validation-error-message
            />
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
                  {{on "keyup" this.keyboard}}
                  {{this.validations.attach "password"}}
                  data-test-password-input
                />
                <YupValidationMessage
                  @description={{t "general.password"}}
                  @validationErrors={{this.validations.errors.password}}
                  data-test-password-validation-error-message
                />
                {{#if this.checkPasswordStrength}}
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
