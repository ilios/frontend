import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isTesting } from '@embroider/macros';
import { task, timeout } from 'ember-concurrency';
import config from 'frontend/config/environment';

const ONE_MINUTE = 60000;

export default class NewVersionService extends Service {
  @tracked latestVersion = undefined;

  get currentVersion() {
    return config.newVersion.currentVersion;
  }

  get isNewVersionAvailable() {
    return this.latestVersion && this.currentVersion !== this.latestVersion;
  }

  get url() {
    return config.rootURL + config.newVersion.versionFile;
  }

  constructor() {
    super(...arguments);
    // don't autostart this task in a test environment.
    if (!isTesting()) {
      this.updateVersion.perform();
    }
  }

  updateVersion = task(async () => {
    try {
      const response = await fetch(this.url + '?_=' + Date.now());
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const payload = await response.text();
      this.latestVersion = payload ? payload.trim() : undefined;
    } catch (e) {
      this.onError(e);
    } finally {
      // @todo figure out a way to test the recursion. For now, don't run it in test mode [ST 2024/04/09]
      if (!isTesting()) {
        await timeout(ONE_MINUTE);
        this.updateVersion.perform();
      }
    }
  });

  onError(error) {
    if (!isTesting()) {
      console.error(error);
    }
  }
}
