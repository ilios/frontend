import Component from '@glimmer/component';
import { all } from 'rsvp';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class PendingSingleUserUpdateComponent extends Component {
  @service flashMessages;
  @use updates = new ResolveAsyncValue(() => [this.args.user.pendingUserUpdates, []]);

  get isSaving() {
    return (
      this.updateEmailAddress.isRunning ||
      this.disableUser.isRunning ||
      this.excludeFromSync.isRunning
    );
  }

  @dropTask
  *updateEmailAddress(update) {
    this.args.user.set('email', update.value);
    yield this.args.user.save();
    yield update.destroyRecord();
    this.flashMessages.success('general.savedSuccessfully');
  }

  @dropTask
  *disableUser() {
    const updates = yield this.args.user.pendingUserUpdates;
    this.args.user.set('enabled', false);
    yield this.args.user.save();
    yield all(updates.map((update) => update.destroyRecord()));
    this.flashMessages.success('general.savedSuccessfully');
  }

  @dropTask
  *excludeFromSync() {
    const updates = yield this.args.user.pendingUserUpdates;
    this.args.user.set('userSyncIgnore', true);
    yield this.args.user.save();
    yield all(updates.map((update) => update.destroyRecord()));
    this.flashMessages.success('general.savedSuccessfully');
  }
}
