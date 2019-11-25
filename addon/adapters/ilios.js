import RESTAdapter from '@ember-data/adapter/rest';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { pluralize } from 'ember-inflector';

export default RESTAdapter.extend({
  iliosConfig: service(),
  session: service(),

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),

  /**
   * Force Fetch since we're still using jQuery
   * https://github.com/emberjs/data/issues/6759
   */
  useFetch: true,

  init() {
    this._super(...arguments);

    const headers = {};
    if (this.session && this.session.isAuthenticated) {
      const { jwt } = this.session.data.authenticated;
      if (jwt) {
        headers['X-JWT-Authorization'] = `Token ${jwt}`;
      }
    }

    this.set('headers', headers);
  },

  coalesceFindRequests: true,

  shouldReloadAll() { return true; },

  findMany(store, type, ids, snapshots) {
    const url = this.urlForFindMany(ids, type.modelName, snapshots);

    return this.ajax(url, 'GET', {
      data: {
        filters: { id: ids },
      }
    });
  },

  pathForType(type) {
    return pluralize(type.camelize().toLowerCase());
  },

  sortQueryParams: false,
});
