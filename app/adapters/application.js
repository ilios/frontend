import Ember from 'ember';
import DS from 'ember-data';
import config from 'ilios/config/environment';

const { RESTAdapter } = DS;

export default RESTAdapter.extend({
  namespace: config.adapterNamespace,

  coalesceFindRequests: true,

  findMany(store, type, ids, snapshots) {
    let url = this.urlForFindMany(ids, type.modelName, snapshots);

    return this.ajax(url, 'GET', {
      data: {
        filters: { id: ids },
        limit: 1000000
      }
    });
  },

  pathForType(type) {
    return Ember.String.pluralize(type.camelize().toLowerCase());
  },

  sortQueryParams: false
});
