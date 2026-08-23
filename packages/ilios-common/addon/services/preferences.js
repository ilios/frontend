import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const URL = '/application/preferences';
const VERSION = 1;
export default class Preferences extends Service {
  @service fetch;

  @tracked _locale;

  async setup() {
    const response = await this.fetch.getFromApiHost(URL);
    if (response.status === 404) {
      return await this.#save();
    }
    if (response.ok) {
      const { preferences } = await response.json();
      this.#trackPreferences(preferences);
    }
  }

  async setLocale(locale) {
    this._locale = locale;
    return this.#save();
  }

  get locale() {
    return this._locale;
  }

  set locale(v) {
    throw new Error('locale must be set through setLocale()');
  }

  async #save() {
    const body = {
      version: VERSION,
      preferences: {
        locale: this._locale,
      },
    };
    const str = JSON.stringify(body);
    const { preferences } = await this.fetch.putToApiHost(URL, str);
    this.#trackPreferences(preferences);
  }

  #trackPreferences(obj) {
    this._locale = obj.locale ?? undefined;
  }
}
