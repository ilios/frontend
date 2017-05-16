import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import IliosAdapter from 'ilios/adapters/ilios';

export default IliosAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:token'
});
