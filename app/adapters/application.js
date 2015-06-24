import Ember from 'ember';
import DS from 'ember-data';
import config from 'ilios/config/environment';

export default DS.RESTAdapter.extend({
    namespace: config.adapterNamespace,
    coalesceFindRequests: true,
    findMany: function(store, type, ids, snapshots) {
      let url = this.urlForFindMany(ids, type.modelName, snapshots);
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
      return Ember.String.pluralize(type.camelize().toLowerCase());
    }
});
