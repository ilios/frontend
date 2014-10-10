import DS from 'ember-data';
import config from 'ilios/config/environment';

export default DS.RESTAdapter.extend({
    namespace: config.adapterNamespace,
    host: config.adapterHost
});
