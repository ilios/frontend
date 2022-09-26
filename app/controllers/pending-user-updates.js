import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { findById } from 'ilios-common/utils/array-helpers';

export default class PendingUserUpdatesController extends Controller {
  @service flashMessages;
  @service store;

  queryParams = ['filter', 'school'];

  @tracked filter = '';
  @tracked school = null;
  @tracked updatesBeingSaved = [];
  @tracked deletedUpdates = [];

  get hasMoreThanOneSchool() {
    return this.model.schools.length > 1;
  }

  get selectedSchool() {
    if (this.school) {
      const school = findById(this.model.schools.slice(), this.school);
      if (school) {
        return school;
      }
    }
    return this.model.primarySchool;
  }

  get updatesInCurrentSchool() {
    return this.model.allPendingUpdates.filter((update) => {
      const user = this.store.peekRecord('user', update.belongsTo('user').id());
      const schoolId = user.belongsTo('school').id();
      return this.selectedSchool.id === schoolId;
    });
  }

  get displayedUpdates() {
    return this.updatesInCurrentSchool.filter((update) => {
      const user = this.store.peekRecord('user', update.belongsTo('user').id());
      const isNotDeleted = !this.deletedUpdates.includes(update);
      const noUpdateName = !!user.fullName;
      const filterMatch = update
        .get('user.fullName')
        .trim()
        .toLowerCase()
        .includes(this.filter.trim().toLowerCase());
      return isNotDeleted && (noUpdateName || filterMatch);
    });
  }

  updateEmailAddress = task(async (update) => {
    this.updatesBeingSaved = [...this.updatesBeingSaved, update];
    const user = await update.user;
    user.email = update.value;
    await user.save();

    await update.destroyRecord();
    this.deletedUpdates = [...this.deletedUpdates, update];
    this.updatesBeingSaved = this.updatesBeingSaved.filter((u) => u !== update);
    this.flashMessages.success('general.savedSuccessfully');
  });

  disableUser = task(async (update) => {
    this.updatesBeingSaved = [...this.updatesBeingSaved, update];
    const user = await update.user;
    user.enabled = false;
    await user.save();

    const updates = await user.pendingUserUpdates;
    await Promise.all(updates.map((update) => update.destroyRecord()));

    this.deletedUpdates = [...this.deletedUpdates, ...updates.slice()];
    this.updatesBeingSaved = this.updatesBeingSaved.filter((u) => u !== update);
    this.flashMessages.success('general.savedSuccessfully');
  });

  excludeFromSync = task(async (update) => {
    this.updatesBeingSaved = [...this.updatesBeingSaved, update];
    const user = await update.user;
    user.userSyncIgnore = true;
    await user.save();

    const updates = await user.pendingUserUpdates;
    await Promise.all(updates.map((update) => update.destroyRecord()));

    this.deletedUpdates = [...this.deletedUpdates, ...updates.slice()];
    this.updatesBeingSaved = this.updatesBeingSaved.filter((u) => u !== update);
    this.flashMessages.success('general.savedSuccessfully');
  });
}
