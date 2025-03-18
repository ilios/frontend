import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { all } from 'rsvp';
import { dropTask, timeout } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { ValidateIf } from 'class-validator';
import { validatable, IsEmail, NotBlank, Length } from 'ilios-common/decorators/validation';
import { modifier } from 'ember-modifier';

@validatable
export default class UserProfileBioComponent extends Component {
  @service currentUser;
  @service iliosConfig;
  @service intl;
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
  @tracked
  @Length(1, 100)
  @NotBlank()
  username;
  @tracked showSyncErrorMessage = false;
  @tracked showUsernameTakenErrorMessage = false;
  @tracked changeUserPassword = false;
  @tracked updatedFieldsFromSync = [];
  @tracked passwordStrengthScore = 0;
  @tracked hasSavedRecently = false;

  userSearchTypeConfig = new TrackedAsyncData(this.iliosConfig.getUserSearchType());

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
  }

  getAuthUser = modifier((element, [userAuthentication]) => {
    if (userAuthentication) {
      this.username = userAuthentication.username;
      this.password = '';
      this.passwordStrengthScore = 0;
    }
  });

  @cached
  get userAuthenticationData() {
    return new TrackedAsyncData(this.args.user.authentication);
  }

  get userAuthentication() {
    return this.userAuthenticationData.isResolved ? this.userAuthenticationData.value : null;
  }

  @cached
  get hasErrorForPasswordData() {
    return new TrackedAsyncData(this.hasErrorFor('password'));
  }

  get hasErrorForPassword() {
    return this.hasErrorForPasswordData.isResolved ? this.hasErrorForPasswordData.value : false;
  }

  @cached
  get userSearchType() {
    return this.userSearchTypeConfig.isResolved ? this.userSearchTypeConfig.value : null;
  }

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
    if (this.canEditUsernameAndPassword && this.changeUserPassword) {
      auth.set('password', this.password);
    }
    await auth.save();
    await user.save();
    const pendingUpdates = await user.pendingUserUpdates;
    await all(pendingUpdates.map((update) => update.destroyRecord()));
    this.clearErrorDisplay();
    this.cancel();
    this.hasSavedRecently = true;
    await timeout(500);
    this.hasSavedRecently = false;
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
      const displayName = this.displayName;
      const pronouns = this.pronouns;
      const email = this.email;
      const username = this.username;
      const phone = this.phone;
      const campusId = this.campusId;
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
}
