import Component from '@glimmer/component';
import { all } from 'rsvp';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import eq from 'ember-truth-helpers/helpers/eq';
import t from 'ember-intl/helpers/t';
import { concat } from '@ember/helper';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import {
  faBan,
  faCircleArrowUp,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

export default class PendingSingleUserUpdateComponent extends Component {
  @service flashMessages;
  @service intl;

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

  updateEmailAddress = task({ drop: true }, async (update) => {
    this.args.user.set('email', update.value);
    await this.args.user.save();
    await update.destroyRecord();
    this.flashMessages.success(this.intl.t('general.savedSuccessfully'), {
      capitalize: true,
    });
  });

  disableUser = task({ drop: true }, async () => {
    const updates = await this.args.user.pendingUserUpdates;
    this.args.user.set('enabled', false);
    await this.args.user.save();
    await all(updates.map((update) => update.destroyRecord()));
    this.flashMessages.success(this.intl.t('general.savedSuccessfully'), {
      capitalize: true,
    });
  });

  excludeFromSync = task({ drop: true }, async () => {
    const updates = await this.args.user.pendingUserUpdates;
    this.args.user.set('userSyncIgnore', true);
    await this.args.user.save();
    await all(updates.map((update) => update.destroyRecord()));
    this.flashMessages.success(this.intl.t('general.savedSuccessfully'), {
      capitalize: true,
    });
  });
  <template>
    <div class="pending-single-user-updates" data-test-pending-single-user-update ...attributes>

      {{#each this.updates as |update|}}
        <div class="update" data-test-update>
          <div class="explanation" data-test-explanation>
            <FaIcon @icon={{faTriangleExclamation}} class="no" />
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
                  <FaIcon @icon={{faCircleArrowUp}} class="yes" @title={{t "general.update"}} />
                  {{t "general.pendingUserUpdates.updateIlios"}}
                </button>
              {{/if}}
              <button
                type="button"
                {{on "click" (perform this.excludeFromSync)}}
                data-test-exclude-from-sync
              >
                <FaIcon @icon={{faBan}} class="no" @title={{t "general.excludeFromSync"}} />
                {{t "general.excludeFromSync"}}
              </button>
              <button type="button" {{on "click" (perform this.disableUser)}} data-test-disable>
                <FaIcon @icon={{faXmark}} class="no" @title={{t "general.disableUser"}} />
                {{t "general.disableUser"}}
              </button>
            {{/if}}
          </div>
        </div>
      {{/each}}
    </div>
  </template>
}
