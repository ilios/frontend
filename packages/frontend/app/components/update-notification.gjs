import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';

export default class UpdateNotificationComponent extends Component {
  @service newVersion;

  /**
   * send a message to update every tab attached to this worker
   * this message is caught by our sw-skip-wait in-repo addon
   */
  click = task({ restartable: true }, async () => {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage('skipWaiting');
      }
    }
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload(true);
    }
  });
  <template>
    {{#if this.newVersion.isNewVersionAvailable}}
      <div class="update-notification" data-test-update-notification>
        <button type="button" {{on "click" (perform this.click)}}>
          {{t "general.iliosUpdatePending"}}
        </button>
      </div>
    {{/if}}
  </template>
}
