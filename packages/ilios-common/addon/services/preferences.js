import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isTesting } from '@embroider/macros';

const URL = '/application/preferences';
const VERSION = 1;
const LOCAL_STORAGE_KEY = 'ilios';
const DEFAULT_LOCALE = 'en-us';

export default class Preferences extends Service {
  @service fetch;
  @service currentUser;

  @tracked _locale;

  async setup() {
    if (!this.currentUser.currentUserId) {
      console.warn('Attempted to load preferences for unauthenticated user');
      return;
    }
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

  /**
   * Always return a value in order of:
   * 1. Saved in user preferences
   * 2. Saved in local storage
   * 3. default value
   */
  get locale() {
    return this._locale ?? this.#loadFromLocalStorage('locale') ?? DEFAULT_LOCALE;
  }

  set locale(v) {
    throw new Error('locale must be set through setLocale()');
  }

  async #save() {
    const body = {
      version: VERSION,
      preferences: {
        locale: this.locale,
      },
    };
    const str = JSON.stringify(body);
    if (!isTesting()) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, str);
    }
    if (this.currentUser.currentUserId) {
      const { preferences } = await this.fetch.putToApiHost(URL, str);
      this.#trackPreferences(preferences);
    }
  }

  #trackPreferences(obj) {
    this._locale = obj.locale ?? undefined;
  }

  #loadFromLocalStorage(name) {
    if (isTesting()) {
      return undefined;
    }
    const store = window.localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!store) {
      return undefined;
    }

    const obj = JSON.parse(store);

    //check if the key is saved in unversioned local storage
    if (obj[name]) {
      return obj[name];
    }

    return obj?.preferences[name];
  }
}
