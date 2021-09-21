import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { all } from 'rsvp';
import { dropTask, restartableTask } from 'ember-concurrency';

export default class PendingUserUpdatesComponent extends Component {
  @service flashMessages;
  @service store;

  @tracked sortSchoolsBy = null;
  @tracked updates = [];
  @tracked deletedUpdates = [];

  get hasMoreThanOneSchool() {
    if (this.args.schools) {
      return this.args.schools.toArray().length > 1;
    }
    return false;
  }

  get filter() {
    return this.args.filter ?? '';
  }

  get sortedSchools() {
    if (this.args.schools) {
      return this.args.schools.sortBy('title');
    }
    return [];
  }

  get availableUpdates() {
    return this.updates.filter((update) => {
      return !this.deletedUpdates.includes(update);
    });
  }

  get selectedSchool() {
    const schoolId = this.args.school;
    if (schoolId) {
      const school = this.args.schools.findBy('id', schoolId);
      if (school) {
        return school;
      }
    }
    return this.args.primarySchool;
  }

  @restartableTask
  *load() {
    const school = this.selectedSchool;
    const filters = { schools: [school.id] };
    const updates = yield this.store.query('pending-user-update', { filters });
    yield all(updates.mapBy('user'));
    const end = this.args.limit + this.args.offset;
    this.updates = updates
      .sortBy('user.fullName')
      .slice(this.args.offset, end)
      .filter((update) => {
        const isNotDeleted = !this.deletedUpdates.includes(update);
        const noUpdateName = isEmpty(update.get('user.fullName'));
        const filterMatch = update
          .get('user.fullName')
          .trim()
          .toLowerCase()
          .includes(this.filter.trim().toLowerCase());
        return isNotDeleted && (noUpdateName || filterMatch);
      });
  }

  @action
  changeSelectedSchool(schoolId) {
    this.args.setSchool(schoolId);
  }

  @action
  changeFilter(filter) {
    this.args.setFilter(filter);
  }

  @dropTask
  *updateEmailAddress(update) {
    const user = yield update.user;
    user.set('email', update.value);
    yield user.save();
    this.deletedUpdates.pushObject(update);
    yield update.destroyRecord();
    this.flashMessages.success('general.savedSuccessfully');
  }

  @dropTask
  *disableUser(update) {
    const user = yield update.user;
    user.set('enabled', false);
    yield user.save();
    const updates = yield user.pendingUserUpdates;
    this.deletedUpdates.pushObjects(updates.toArray());
    yield all(updates.invoke('destroyRecord'));
    this.flashMessages.success('general.savedSuccessfully');
  }

  @dropTask
  *excludeFromSync(update) {
    const user = yield update.user;
    user.set('userSyncIgnore', true);
    yield user.save();
    const updates = yield user.pendingUserUpdates;
    this.deletedUpdates.pushObjects(updates.toArray());
    yield all(updates.invoke('destroyRecord'));
    this.flashMessages.success('general.savedSuccessfully');
  }
}
