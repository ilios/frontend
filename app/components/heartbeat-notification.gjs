import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { eq } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';

export default class HeartbeatNotificationComponent extends Component {
  @service heartbeat;

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
    {{#if (eq this.heartbeat.latestCode 200)}}
      <div class="heartbeat-notification" data-test-heartbeat-notification>
        <div class="message">{{t "general.apiConnected"}}</div>
      </div>
    {{/if}}
    {{#if (eq this.heartbeat.latestCode 503)}}
      <div class="heartbeat-notification critical-notice" data-test-heartbeat-notification>
        <div class="message">
          <details>
            <summary>
              <span class="not-connected">{{t "general.apiNotConnected"}}</span>
              <span class="reconnecting">{{t
                  "general.apiReconnecting"
                  counter=this.heartbeat.counter
                }}</span>
            </summary>
            {{this.heartbeat.latestMessage}}
          </details>
        </div>
      </div>
    {{/if}}
  </template>
}
