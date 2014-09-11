import DS from 'ember-data';

export default DS.RESTAdapter.extend({
    namespace: IliosENV.adapterNamespace,
    host: IliosENV.adapterHost
});
