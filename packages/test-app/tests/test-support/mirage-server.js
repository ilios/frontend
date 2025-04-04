import commonRoutes from './mirage/routes';
import commonModels from './mirage/models';
import commonFactories from './mirage/factories';
import applicationSerializer from './mirage/serializers/application';
import ENV from 'test-app/config/environment';
import { createServer } from 'miragejs';
import { pluralize, singularize } from 'ember-inflector';

const { apiVersion } = ENV;

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
      this.get('application/config', function () {
        return {
          config: {
            type: 'form',
            materialStatusEnabled: true,
            apiVersion,
            showCampusNameOfRecord: true,
          },
        };
      });
    },
  };

  return createServer(finalConfig);
}
