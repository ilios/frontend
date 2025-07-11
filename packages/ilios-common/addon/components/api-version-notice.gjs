import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';
import not from 'ember-truth-helpers/helpers/not';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';

export default class ApiVersionNoticeComponent extends Component {
  @service apiVersion;

  @tracked mismatched = false;
  @tracked updateAvailable = false;
  @tracked countdownToUpdate = null;
  @tracked showReloadButton = false;

  constructor() {
    super(...arguments);
    this.check.perform();
  }

  reload() {
    window.location.reload();
  }

  check = dropTask(async () => {
    const mismatched = await this.apiVersion.getIsMismatched();
    if (mismatched && 'serviceWorker' in navigator) {
      await 2000; //wait to let the new service worker get fetched if it is available
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        if (reg.waiting) {
          this.update.perform();
        } else {
          reg.onupdatefound = () => {
            this.countdown.perform();
          };
        }
      } else {
        this.showReloadButton = true;
      }
    }
    this.mismatched = mismatched;
    return true; //always return true to update data-test-load-finished property
  });

  countdown = dropTask(async () => {
    this.updateAvailable = true;
    for (let i = 5; i > 0; i--) {
      this.countdownToUpdate = i;
      await timeout(1000);
    }
    await this.update.perform();
  });

  update = dropTask(async () => {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage('skipWaiting');
      }
    }
    await timeout(3000);
  });
  <template>
    <div
      class="api-version-notice{{if this.mismatched ' mismatch'}}"
      hidden={{not this.mismatched}}
      role={{if this.mismatched "alert" false}}
      data-test-load-finished={{this.check.lastSuccessful.value}}
      data-test-api-version-notice
    >
      <h2>
        <FaIcon @icon="circle-exclamation" />
        {{t "general.apiVersionMismatch"}}
      </h2>
      <div class="details">
        <p>
          {{t "general.apiVersionMismatchDetails"}}
        </p>
        {{#if this.updateAvailable}}
          <p>
            {{t "general.autoUpdatingSeconds" count=this.countdownToUpdate}}
            <button type="button" {{on "click" (perform this.update)}}>
              {{t "general.updateNow"}}
            </button>
          </p>
        {{/if}}
        {{#if this.update.isRunning}}
          <p>
            {{t "general.updatePending"}}
          </p>
        {{/if}}
        {{#if this.showReloadButton}}
          <p>
            <button type="button" {{on "click" this.reload}}>
              {{t "general.updateNow"}}
            </button>
          </p>
        {{/if}}
      </div>
    </div>
  </template>
}
