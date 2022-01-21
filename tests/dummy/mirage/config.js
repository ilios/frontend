import commonRoutes from './routes';
import ENV from 'dummy/config/environment';
import { createServer, discoverEmberDataModels } from 'ember-cli-mirage';

const { apiVersion } = ENV;

export default function (config) {
  let finalConfig = {
    ...config,
    models: { ...discoverEmberDataModels(), ...config.models },
    routes() {
      this.namespace = '/';
      commonRoutes(this);
      this.get('application/config', function () {
        return {
          config: {
            type: 'form',
            apiVersion,
          },
        };
      });
    },
  };

  return createServer(finalConfig);
}
