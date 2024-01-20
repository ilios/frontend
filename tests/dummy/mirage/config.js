import commonRoutes from './routes';
import ENV from 'dummy/config/environment';
import { createServer } from 'miragejs';

const { apiVersion } = ENV;

export default function (config) {
  let finalConfig = {
    ...config,
    routes() {
      this.passthrough('/write-coverage');
      this.namespace = '/';
      commonRoutes(this);
      this.get('application/config', function () {
        return {
          config: {
            type: 'form',
            materialStatusEnabled: true,
            apiVersion,
          },
        };
      });
    },
  };

  return createServer(finalConfig);
}
