import Component from '@glimmer/component';
import { service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';
import { tracked, cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { findBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

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
}
