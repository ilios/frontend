import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Ember from 'ember';
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
    const baseUrl = config.prepend || config.rootURL || config.baseURL;
    return baseUrl + config.newVersion.versionFile;
  }

  constructor() {
    super(...arguments);
    if (!Ember.testing) {
      this.updateVersion.perform();
    }
  }

  updateVersion = task(async () => {
    try {
      const response = fetch(this.url + '?_=' + Date.now());
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const payload = await response.text();
      this.latestVersion = payload ? payload.trim() : undefined;
    } catch (e) {
      this.onError(e);
    } finally {
      await timeout(ONE_MINUTE);
      this.updateVersion.perform();
    }
  });

  onError(error) {
    if (!Ember.testing) {
      console.log(error);
    }
  }
}
