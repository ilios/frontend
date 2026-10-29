import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { registerDestructor } from '@ember/destroyable';
import { action } from '@ember/object';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import t from 'ember-intl/helpers/t';
import { isTesting } from '@embroider/macros';
import { on } from '@ember/modifier';
import { eq } from 'ember-truth-helpers';
import perform from 'ember-concurrency/helpers/perform';
import toggle from '../helpers/toggle';
import { faCircleExclamation, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

export default class ConnectionStatusComponent extends Component {
  @tracked isOnline = true;
  @tracked isConnectedToApi = true;
  @tracked multiplier = 1;
  @tracked stopAttemptingToReconnect = false;
  @tracked timer = 5;
  @tracked unableToReconnect = false;
  @tracked latestApiCode = undefined;
  @tracked latestApiMessage = undefined;
  @tracked apiCheckCounter = 10;
  @tracked index = 0;

  onlineListener;
  offlineListener;

  constructor(...args) {
    super(...args);
    if (!navigator.onLine) {
      this.changeConnectionState.perform(false);
    }
    window.addEventListener('online', this.online, {
      passive: true,
      capture: false,
    });
    window.addEventListener('offline', this.offline, {
      passive: true,
      capture: false,
    });

    if (!isTesting()) {
      this.checkApiConnection.perform();
    }

    registerDestructor(this, () => {
      window.removeEventListener('online', this.online);
      window.removeEventListener('offline', this.offline);
    });
  }

  get apiUrl() {
    const codes = [200, 503];
    const code = codes[this.index];
    return `https://dave.neb.host?http_code=${code}`;
  }

  @action
  online() {
    this.changeConnectionState.perform(true);
  }

  @action
  offline() {
    this.changeConnectionState.perform(false);
  }

  changeConnectionState = task({ restartable: true }, async (isOnline) => {
    this.timer = 5;
    this.multiplier = 1;
    this.stopAttemptingToReconnect = false;
    this.isOnline = isOnline;
    if (!isOnline) {
      await this.reconnect.perform();
    } else {
      this.reconnect.cancelAll();
      this.checkApiConnection.perform();
    }
  });

  checkApiConnection = task(async () => {
    if (this.isOnline) {
      try {
        const response = await fetch(this.apiUrl);
        const payload = await response.json();
        this.latestApiCode = payload.status ?? undefined;
        this.latestApiMessage = payload.message ?? undefined;
        this.index = this.index == 0 ? 1 : 0;
      } catch (e) {
        this.onApiCheckError(e);
      } finally {
        if (!isTesting()) {
          this.apiCheckCounter = 10;
          const intervalID = setInterval(() => {
            this.apiCheckCounter -= 1;

            if (this.apiCheckCounter == 0) {
              clearInterval(intervalID);
              this.checkApiConnection.perform();
            }
          }, 1000);
        }
      }
    }
  });

  onApiCheckError(error) {
    if (!isTesting()) {
      console.error(error);
    }
  }

  reconnect = task({ restartable: true }, async (force) => {
    await timeout(1);
    if (navigator.onLine) {
      this.changeConnectionState.perform(true);
    }
    if (force) {
      this.unableToReconnect = true;
      this.timer = 5;
      await timeout(2000);
      this.unableToReconnect = false;
    } else if (this.timer > 1) {
      this.unableToReconnect = false;
      this.timer = this.timer - 1;
    } else {
      if (!this.stopAttemptingToReconnect) {
        this.unableToReconnect = true;
        await timeout(2000);
      }
      const newMultiplier = this.multiplier < 8 ? this.multiplier * 2 : 10;
      this.multiplier = newMultiplier;
      this.timer = 5 * newMultiplier;
    }

    await timeout(1000);
    this.reconnect.perform();
  });
  <template>
    <div class="connection-status" test-data-connection-status>
      {{#if this.isOnline}}
        <div
          class="api-connection-status{{if (eq this.latestApiCode 503) ' critical-notice'}}"
          aria-hidden={{this.isConnectedToApi}}
          data-test-api-connection-status
        >
          {{#if (eq this.latestApiCode 503)}}
            <div class="message">
              <details>
                <summary>
                  <span class="not-connected">{{t "general.apiNotConnected"}}</span>
                  <span class="reconnecting">{{t
                      "general.apiReconnecting"
                      counter=this.apiCheckCounter
                    }}</span>
                </summary>
                {{this.latestApiMessage}}
              </details>
            </div>
          {{/if}}
        </div>
      {{else}}
        <div
          class="network-connection-status critical-notice{{unless this.isOnline ' offline'}}"
          aria-hidden={{this.isOnline}}
          data-test-network-connection-status
        >
          {{#if this.unableToReconnect}}
            <p class="unable-to-reconnect">
              <FaIcon @icon={{faTriangleExclamation}} />
              {{t "general.unableToReconnect"}}
            </p>
          {{else}}
            <p>
              <FaIcon @icon={{faCircleExclamation}} />
              {{t "general.connectionLost"}}
              {{#unless this.stopAttemptingToReconnect}}
                {{t "general.reconnectionSeconds" count=this.timer}}
              {{/unless}}
            </p>
            <div class="buttons">
              <button type="button" {{on "click" (perform this.reconnect true)}}>
                {{t "general.reconnectNow"}}
              </button>
              {{#unless this.stopAttemptingToReconnect}}
                <button type="button" {{on "click" (toggle "stopAttemptingToReconnect" this)}}>
                  {{t "general.ignore"}}
                </button>
              {{/unless}}
            </div>
          {{/if}}
        </div>
      {{/if}}
    </div>
  </template>
}
