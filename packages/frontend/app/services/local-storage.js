import Service, { service } from '@ember/service';
import { isTesting } from '@embroider/macros';
import config from 'frontend/config/environment';

export default class LocalStorageService extends Service {
  @service intl;

  get(item = null) {
    if (isTesting()) {
      return null;
    }

    const key = JSON.parse(localStorage.getItem(config.APP.LOCAL_STORAGE_KEY));

    if (key) {
      if (item) {
        const itemValue = key[item];

        return itemValue !== undefined ? itemValue : null;
      } else {
        return key;
      }
    } else {
      return localStorage.setItem(
        config.APP.LOCAL_STORAGE_KEY,
        JSON.stringify(config.APP.DEFAULTS.localStorage),
      );
    }
  }

  set(item, value) {
    if (isTesting()) {
      return;
    } else {
      const key = JSON.parse(localStorage.getItem(config.APP.LOCAL_STORAGE_KEY));

      // if localStorage[key] exists, move on
      if (key) {
        // if localStorage[key][item] exists, move on
        if (key[item] !== undefined) {
          key[item] = value;
          localStorage.setItem(config.APP.LOCAL_STORAGE_KEY, JSON.stringify(key));
        }
        // otherwise, check if item has default value
        else {
          // if so, set item to default value
          if (Object.hasOwn(config.APP.DEFAULTS.localStorage, item)) {
            key[item] = config.APP.DEFAULTS.localStorage[item];
            localStorage.setItem(config.APP.LOCAL_STORAGE_KEY, JSON.stringify(key));
          }
          // otherwise, throw error
          else {
            console.error(
              this.intl.t('errors.localStorageSetItemFail', {
                keyName: config.APP.LOCAL_STORAGE_KEY,
                itemName: item,
                value: value,
              }),
            );
          }
        }
      }
      // if the key doesn't exist at all, create default key
      else {
        const obj = {};
        obj[item] = value;
        localStorage.setItem(config.APP.LOCAL_STORAGE_KEY, JSON.stringify(obj));
      }
    }
  }
}
