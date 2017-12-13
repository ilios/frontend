import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import { pluralize } from 'ember-inflector';

const { RESTAdapter } = DS;

export default RESTAdapter.extend(DataAdapterMixin, {
  iliosConfig: service(),

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),

  coalesceFindRequests: true,

  findMany(store, type, ids, snapshots) {
    let url = this.urlForFindMany(ids, type.modelName, snapshots);

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
  authorizer: 'authorizer:token'
});
