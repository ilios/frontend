import Service, { service } from '@ember/service';
import ENV from 'frontend/config/environment';

export default class LocalStorageService extends Service {
  @service intl;

  get(item = null) {
    const settings = JSON.parse(localStorage.getItem(ENV.APP.LOCAL_STORAGE_KEY));

    if (settings) {
      if (item) {
        const keyVal = settings[item];

        if (keyVal !== undefined) {
          return settings[item];
        } else {
          console.error(
            this.intl.t('errors.localStorageGetItemFail', {
              keyName: ENV.APP.LOCAL_STORAGE_KEY,
              itemName: item,
            }),
          );

          return null;
        }
      } else {
        return settings;
      }
    } else {
      return localStorage.setItem(
        ENV.APP.LOCAL_STORAGE_KEY,
        JSON.stringify(ENV.APP.DEFAULTS.localStorage),
      );
    }
  }

  set(item, value) {
    const settings = JSON.parse(localStorage.getItem(ENV.APP.LOCAL_STORAGE_KEY));

    // if localStorage[key] exists, move on
    if (settings) {
      // if localStorage[key][item] exists, move on
      if (settings[item] !== undefined) {
        settings[item] = value;
        localStorage.setItem(ENV.APP.LOCAL_STORAGE_KEY, JSON.stringify(settings));
      }
      // otherwise, check if item has default value
      else {
        // if so, set item to default value
        if (Object.hasOwn(ENV.APP.DEFAULTS.localStorage, item)) {
          settings[item] = ENV.APP.DEFAULTS.localStorage[item];
          localStorage.setItem(ENV.APP.LOCAL_STORAGE_KEY, JSON.stringify(settings));
        }
        // otherwise, throw error
        else {
          console.error(
            this.intl.t('errors.localStorageSetItemFail', {
              keyName: ENV.APP.LOCAL_STORAGE_KEY,
              itemName: item,
              value: value,
            }),
          );
        }

        return null;
      }
    }
    // otherwise, create default key
    else {
      const obj = {};
      obj[item] = value;
      return localStorage.setItem(ENV.APP.LOCAL_STORAGE_KEY, JSON.stringify(obj));
    }
  }
}
