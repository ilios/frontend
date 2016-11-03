import Ember from 'ember';
import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

const { inject, computed } = Ember;
const { service } = inject;
const { reads } = computed;
const { RESTAdapter } = DS;

export default RESTAdapter.extend(DataAdapterMixin, {
  iliosConfig: service(),

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),

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
