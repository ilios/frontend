import Ember from 'ember';
import DS from 'ember-data';
import config from 'ilios/config/environment';

export default DS.RESTAdapter.extend({
    namespace: config.adapterNamespace,
    host: config.adapterHost,
    coalesceFindRequests: true,
    findMany: function(store, type, ids, snapshots) {
      let url = this.buildURL(type.typeKey, ids, snapshots, 'findMany');
      return this.ajax(
        url,
        'GET',
        { data: {
          filters: { id: ids },
          limit: 1000000,

          }
        }
      );
    },
    pathForType: function(type) {
      return Ember.String.pluralize(type.toLowerCase());
    }
});
