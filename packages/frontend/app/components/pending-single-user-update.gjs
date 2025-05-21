import Component from '@glimmer/component';
import { all } from 'rsvp';
import { service } from '@ember/service';
import { capitalize } from '@ember/string';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import FaIcon from 'ilios-common/components/fa-icon';
import eq from 'ember-truth-helpers/helpers/eq';
import t from 'ember-intl/helpers/t';
import { concat } from '@ember/helper';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';

export default class PendingSingleUserUpdateComponent extends Component {
  @service flashMessages;

  @cached
  get updatesData() {
    return new TrackedAsyncData(this.args.user.pendingUserUpdates);
  }

  get updates() {
    return this.updatesData.isResolved ? this.updatesData.value : [];
  }

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
    this.flashMessages.success(capitalize('general.savedSuccessfully'));
  });

  disableUser = dropTask(async () => {
    const updates = await this.args.user.pendingUserUpdates;
    this.args.user.set('enabled', false);
    await this.args.user.save();
    await all(updates.map((update) => update.destroyRecord()));
    this.flashMessages.success(capitalize('general.savedSuccessfully'));
  });

  excludeFromSync = dropTask(async () => {
    const updates = await this.args.user.pendingUserUpdates;
    this.args.user.set('userSyncIgnore', true);
    await this.args.user.save();
    await all(updates.map((update) => update.destroyRecord()));
    this.flashMessages.success(capitalize('general.savedSuccessfully'));
  });
  <template>
    <div class="pending-single-user-updates" data-test-pending-single-user-update ...attributes>

      {{#each this.updates as |update|}}
        <div class="update" data-test-update>
          <div class="explanation" data-test-explanation>
            <FaIcon @icon="triangle-exclamation" class="no" />
            {{#if (eq update.type "emailMismatch")}}
              {{t
                "general.pendingUserUpdates.emailMismatch"
                value=update.value
                email=update.user.email
              }}
            {{else}}
              {{t (concat "general.pendingUserUpdates." update.type)}}
            {{/if}}
          </div>
          <div class="actions" data-test-actions>
            {{#if this.isSaving}}
              <LoadingSpinner />
            {{else}}
              {{#if (eq update.type "emailMismatch")}}
                <button
                  type="button"
                  {{on "click" (perform this.updateEmailAddress update)}}
                  data-test-update-email
                >
                  <FaIcon @icon="circle-arrow-up" class="yes" @title={{t "general.update"}} />
                  {{t "general.pendingUserUpdates.updateIlios"}}
                </button>
              {{/if}}
              <button
                type="button"
                {{on "click" (perform this.excludeFromSync)}}
                data-test-exclude-from-sync
              >
                <FaIcon @icon="ban" class="no" @title={{t "general.excludeFromSync"}} />
                {{t "general.excludeFromSync"}}
              </button>
              <button type="button" {{on "click" (perform this.disableUser)}} data-test-disable>
                <FaIcon @icon="xmark" class="no" @title={{t "general.disableUser"}} />
                {{t "general.disableUser"}}
              </button>
            {{/if}}
          </div>
        </div>
      {{/each}}
    </div>
  </template>
}
