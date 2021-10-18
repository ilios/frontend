import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

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
      const school = this.model.schools.findBy('id', this.school);
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

  @task
  *updateEmailAddress(update) {
    this.updatesBeingSaved = [...this.updatesBeingSaved, update];
    const user = yield update.user;
    user.email = update.value;
    yield user.save();

    yield update.destroyRecord();
    this.deletedUpdates = [...this.deletedUpdates, update];
    this.updatesBeingSaved = this.updatesBeingSaved.filter((u) => u !== update);
    this.flashMessages.success('general.savedSuccessfully');
  }

  @task
  *disableUser(update) {
    this.updatesBeingSaved = [...this.updatesBeingSaved, update];
    const user = yield update.user;
    user.enabled = false;
    yield user.save();

    const updates = yield user.pendingUserUpdates;
    yield Promise.all(updates.invoke('destroyRecord'));

    this.deletedUpdates = [...this.deletedUpdates, ...updates.toArray()];
    this.updatesBeingSaved = this.updatesBeingSaved.filter((u) => u !== update);
    this.flashMessages.success('general.savedSuccessfully');
  }

  @task
  *excludeFromSync(update) {
    this.updatesBeingSaved = [...this.updatesBeingSaved, update];
    const user = yield update.user;
    user.userSyncIgnore = true;
    yield user.save();

    const updates = yield user.pendingUserUpdates;
    yield Promise.all(updates.invoke('destroyRecord'));

    this.deletedUpdates = [...this.deletedUpdates, ...updates.toArray()];
    this.updatesBeingSaved = this.updatesBeingSaved.filter((u) => u !== update);
    this.flashMessages.success('general.savedSuccessfully');
  }
}
