import DS from 'ember-data';
import config from 'ilios/config/environment';

export default DS.RESTAdapter.extend({
    namespace: config.adapterNamespace,
    host: config.adapterHost,
    coalesceFindRequests: true,
    findMany: function(store, type, ids, records) {
      return this.ajax(this.buildURL(type.typeKey, ids, records), 'GET', { data: {filters: { id: ids } }});
    }
});
