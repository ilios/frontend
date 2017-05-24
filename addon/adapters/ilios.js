import Ember from 'ember';
import DS from 'ember-data';

const { inject, computed, String:EmberString } = Ember;
const { service } = inject;
const { reads } = computed;
const { RESTAdapter } = DS;
const { pluralize } = EmberString;

export default RESTAdapter.extend({
  iliosConfig: service(),

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),

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
    return pluralize(type.camelize().toLowerCase());
  },

  sortQueryParams: false,
});
