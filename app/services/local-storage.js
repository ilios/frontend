import Service from '@ember/service';
import { isTesting } from '@embroider/macros';

const LOCAL_STORAGE_PREFIX = 'ilios';

export default class LocalStorage extends Service {
  constructor() {
    super(arguments);
    if (!isTesting()) {
      this.#upgradeLocalStorage();
    }
  }
  get locale() {
    if (isTesting()) {
      return undefined;
    }
    return window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}-locale`);
  }

  set locale(locale) {
    if (!isTesting()) {
      window.localStorage.setItem(`${LOCAL_STORAGE_PREFIX}-locale`, locale);
    }
  }

  get theme() {
    if (isTesting()) {
      return undefined;
    }
    return window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}-theme`);
  }

  set theme(theme) {
    if (!isTesting()) {
      window.localStorage.setItem(`${LOCAL_STORAGE_PREFIX}-theme`, theme);
    }
  }

  /**
   * Move locale from our original local storage into its new home
   */
  #upgradeLocalStorage() {
    const oldValue = window.localStorage.getItem('ilios');
    if (oldValue) {
      const obj = JSON.parse(oldValue);
      if (obj.locale) {
        this.locale = obj.locale;
      }
      window.localStorage.removeItem('ilios');
    }
  }
}
