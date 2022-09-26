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

  updateEmailAddress = dropTask(async (update) => {
    this.args.user.set('email', update.value);
    await this.args.user.save();
    await update.destroyRecord();
    this.flashMessages.success('general.savedSuccessfully');
  });

  disableUser = dropTask(async () => {
    const updates = await this.args.user.pendingUserUpdates;
    this.args.user.set('enabled', false);
    await this.args.user.save();
    await all(updates.map((update) => update.destroyRecord()));
    this.flashMessages.success('general.savedSuccessfully');
  });

  excludeFromSync = dropTask(async () => {
    const updates = await this.args.user.pendingUserUpdates;
    this.args.user.set('userSyncIgnore', true);
    await this.args.user.save();
    await all(updates.map((update) => update.destroyRecord()));
    this.flashMessages.success('general.savedSuccessfully');
  });
}
