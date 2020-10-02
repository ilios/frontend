import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';

export default class IliosAdapter extends JSONAPIAdapter {
  @service iliosConfig;
  @service session;
  coalesceFindRequests = true;
  sortQueryParams = false;

  get headers() {
    const headers = {};
    if (this.session?.isAuthenticated) {
      const { jwt } = this.session.data.authenticated;
      if (jwt) {
        headers['X-JWT-Authorization'] = `Token ${jwt}`;
      }
    }

    return headers;
  }

  get host() {
    return this.iliosConfig.apiHost;
  }

  get namespace() {
    return this.iliosConfig.apiNameSpace;
  }

  shouldReloadAll() {
    return true;
  }

  findMany(store, type, ids, snapshots) {
    const url = this.urlForFindMany(ids, type.modelName, snapshots);

    return this.ajax(url, 'GET', {
      data: {
        filters: { id: ids },
      }
    });
  }

  pathForType(type) {
    return pluralize(camelize(type).toLowerCase());
  }

  /**
   * Don't send cookies with API requests
   * https://github.com/emberjs/data/issues/6413
   * Providing the 'omit' option to fetch parameters causes it not to send any cookies
   * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters
   * this is important for us because we store the JWT in a cookie so if we send cookies it will
   * send the JWT at least twice (sometimes more depending on the auth options used)
   */

  /** TEMPORARY DISABLE - LM uploads aren't working on load balanced machines  **/
  // ajaxOptions() {
  //   return {
  //     ...this._super(...arguments),
  //     credentials: 'omit'
  //   };
  // }
}
