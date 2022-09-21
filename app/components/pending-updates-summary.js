import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { filter } from 'rsvp';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import { findById } from 'ilios-common/utils/array-helpers';

export default class PendingUpdatesSummaryComponent extends Component {
  @service currentUser;
  @service store;
  @tracked selectedSchoolId;
  @use user = new ResolveAsyncValue(() => [this.currentUser.getModel()]);

  allUpdatesPromise = this.store.query('pending-user-update', {
    filters: { schools: this.args.schools.mapBy('id') },
    include: 'user',
  });
  @use allUpdates = new ResolveAsyncValue(() => [this.allUpdatesPromise]);
  @use updatesForSchool = new AsyncProcess(() => [
    this.getUpdatesForSchool,
    this.allUpdatesArray,
    this.bestSelectedSchool,
  ]);

  get haveUpdates() {
    return this.updates?.length > 0;
  }

  get bestSelectedSchool() {
    const id = this.selectedSchoolId ?? this.user?.belongsTo('school').id();
    if (id) {
      const school = findById(this.args.schools.slice(), id);
      if (school) {
        return school;
      }
    }
    return this.args.schools.firstObject;
  }

  get areUpdatesLoaded() {
    return Boolean(this.allUpdates);
  }

  get allUpdatesArray() {
    if (!this.allUpdates) {
      return [];
    }

    return this.allUpdates.slice();
  }

  get updates() {
    return this.updatesForSchool ?? [];
  }

  async getUpdatesForSchool(allUpdates, selectedSchool) {
    return filter(allUpdates.slice(), async (update) => {
      const user = await update.user;
      return user.belongsTo('school').id() === selectedSchool.id;
    });
  }
}
