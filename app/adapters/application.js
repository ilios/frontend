import Ember from 'ember';
import DS from 'ember-data';
import config from 'ilios/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

const { RESTAdapter } = DS;

export default RESTAdapter.extend(DataAdapterMixin, {
  namespace: config.adapterNamespace,

  coalesceFindRequests: true,

  // Ember Data 2.0 Reload behavior
  shouldReloadRecord: function() { return true; },
  shouldReloadAll: function() { return true; },
  shouldBackgroundReloadRecord: function() { return true; },
  shouldBackgroundReloadAll: function() { return true; },

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

  sortQueryParams: false,
  
  authorizer: 'authorizer:token'
});
