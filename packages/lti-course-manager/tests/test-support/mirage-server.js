import commonRoutes from './mirage/routes';
import commonModels from './mirage/models';
import commonFactories from './mirage/factories';
import applicationSerializer from './mirage/serializers/application';
import { createServer } from 'miragejs';
import { pluralize, singularize } from 'ember-inflector';

export default function (config) {
  let finalConfig = {
    environment: 'test',
    ...config,
    models: commonModels,
    factories: commonFactories,
    serializers: {
      application: applicationSerializer,
    },
    inflector: {
      pluralize,
      singularize,
    },
    routes() {
      this.namespace = '/';
      commonRoutes(this);
    },
  };

  return createServer(finalConfig);
}
