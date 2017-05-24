import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import IliosAdapter from 'ilios-common/adapters/ilios';

export default IliosAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:token'
});
