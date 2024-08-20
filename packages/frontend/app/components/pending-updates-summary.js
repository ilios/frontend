import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { filter } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { findById } from 'ilios-common/utils/array-helpers';

export default class PendingUpdatesSummaryComponent extends Component {
  @service currentUser;
  @service store;
  @tracked selectedSchoolId;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @cached
  get allUpdatesData() {
    const schools = this.args.schools.map((s) => s.id);
    return new TrackedAsyncData(
      this.store.query('pending-user-update', {
        filters: { schools },
        include: 'user',
      }),
    );
  }

  get allUpdates() {
    return this.allUpdatesData.isResolved ? this.allUpdatesData.value : null;
  }

  @cached
  get updatesData() {
    return new TrackedAsyncData(
      this.getUpdatesForSchool(this.allUpdatesArray, this.bestSelectedSchool),
    );
  }

  get updates() {
    return this.updatesData.isResolved ? this.updatesData.value : [];
  }

  get haveUpdates() {
    return this.updates?.length > 0;
  }

  get bestSelectedSchool() {
    const id = this.selectedSchoolId ?? this.user?.belongsTo('school').id();
    if (id) {
      const school = findById(this.args.schools, id);
      if (school) {
        return school;
      }
    }
    return this.args.schools[0];
  }

  get areUpdatesLoaded() {
    return Boolean(this.allUpdates);
  }

  get allUpdatesArray() {
    if (!this.allUpdates) {
      return [];
    }

    return this.allUpdates;
  }

  async getUpdatesForSchool(allUpdates, selectedSchool) {
    return filter(allUpdates, async (update) => {
      const user = await update.user;
      return user.belongsTo('school').id() === selectedSchool.id;
    });
  }
}
