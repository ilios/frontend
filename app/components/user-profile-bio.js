import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { all } from 'rsvp';
import { dropTask, restartableTask } from 'ember-concurrency';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';
import { ValidateIf } from 'class-validator';
import { validatable, IsEmail, NotBlank, Length } from 'ilios-common/decorators/validation';

@validatable
export default class UserProfileBioComponent extends Component {
  @service currentUser;
  @service iliosConfig;
  @service fetch;
  @service store;

  @tracked @Length(0, 16) campusId;
  @tracked @IsEmail() @Length(1, 100) @NotBlank() email;
  @tracked @Length(0, 200) displayName;
  @tracked @Length(0, 50) pronouns;
  @tracked @Length(1, 50) @NotBlank() firstName;
  @tracked @Length(1, 50) @NotBlank() lastName;
  @tracked @Length(0, 20) middleName;
  @tracked @Length(0, 16) otherId;
  @tracked
  @ValidateIf((o) => o.canEditUsernameAndPassword && o.changeUserPassword)
  @Length(5)
  @NotBlank()
  password;
  @tracked @Length(0, 20) phone;
  @tracked @IsEmail() @Length(0, 100) preferredEmail;
  @tracked @Length(1, 100) @NotBlank() username;
  @tracked showSyncErrorMessage = false;
  @tracked changeUserPassword = false;
  @tracked updatedFieldsFromSync = [];
  @tracked passwordStrengthScore = 0;

  @use userSearchType = new ResolveAsyncValue(() => [this.iliosConfig.getUserSearchType()]);

  get canEditUsernameAndPassword() {
    if (!this.userSearchType) {
      return false;
    }
    return this.userSearchType !== 'ldap';
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
    this.firstName = null;
    this.lastName = null;
    this.middleName = null;
    this.campusId = null;
    this.otherId = null;
    this.email = null;
    this.displayName = null;
    this.pronouns = null;
    this.preferredEmail = null;
    this.phone = null;
    this.username = null;
    this.password = null;
    this.passwordStrengthScore = 0;
    this.changeUserPassword = false;
    this.updatedFieldsFromSync = [];
    this.args.setIsManaging(false);
  }

  @action
  async setPassword(password) {
    this.password = password;
    await this.calculatePasswordStrengthScore();
  }

  @restartableTask
  *load() {
    this.firstName = this.args.user.firstName;
    this.middleName = this.args.user.middleName;
    this.lastName = this.args.user.lastName;
    this.campusId = this.args.user.campusId;
    this.otherId = this.args.user.otherId;
    this.email = this.args.user.email;
    this.displayName = this.args.user.displayName;
    this.pronouns = this.args.user.pronouns;
    this.preferredEmail = this.args.user.preferredEmail;
    this.phone = this.args.user.phone;
    const auth = yield this.args.user.authentication;
    if (auth) {
      this.username = auth.username;
      this.password = '';
      this.passwordStrengthScore = 0;
    }
  }

  @dropTask
  *save() {
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
    const isValid = yield this.isValid();
    if (!isValid) {
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

    let auth = yield user.authentication;
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
    if (this.canEditUsernameAndPassword && this.changeUserPassword) {
      auth.set('password', this.password);
    }
    yield auth.save();
    yield user.save();
    const pendingUpdates = yield user.pendingUserUpdates;
    yield all(pendingUpdates.invoke('destroyRecord'));

    this.clearErrorDisplay();
    this.cancel();
  }

  @dropTask
  *directorySync() {
    this.updatedFieldsFromSync = [];
    this.showSyncErrorMessage = false;
    const userId = this.args.user.id;
    const url = `/application/directory/find/${userId}`;
    try {
      const data = yield this.fetch.getJsonFromApiHost(url);
      const userData = data.result;
      const firstName = this.firstName;
      const lastName = this.lastName;
      const displayName = this.displayName;
      const pronouns = this.pronouns;
      const email = this.email;
      const username = this.username;
      const phone = this.phone;
      const campusId = this.campusId;
      if (userData.firstName !== firstName) {
        this.firstName = userData.firstName;
        this.updatedFieldsFromSync.pushObject('firstName');
      }
      if (userData.lastName !== lastName) {
        this.lastName = userData.lastName;
        this.updatedFieldsFromSync.pushObject('lastName');
      }
      if (userData.displayName !== displayName) {
        this.displayName = userData.displayName;
        this.updatedFieldsFromSync.pushObject('displayName');
      }
      if (userData.pronouns !== pronouns) {
        this.pronouns = userData.pronouns;
        this.updatedFieldsFromSync.pushObject('pronouns');
      }
      if (userData.email !== email) {
        this.email = userData.email;
        this.updatedFieldsFromSync.pushObject('email');
      }

      if (userData.campusId !== campusId) {
        this.campusId = userData.campusId;
        this.updatedFieldsFromSync.pushObject('campusId');
      }
      if (userData.phone !== phone) {
        this.phone = userData.phone;
        this.updatedFieldsFromSync.pushObject('phone');
      }
      if (userData.username !== username) {
        this.username = userData.username;
        this.updatedFieldsFromSync.pushObject('username');
      }
    } catch (e) {
      this.showSyncErrorMessage = true;
    }
  }
}
