import commonRoutes from './routes';
import ENV from '../config/environment';
import { createServer } from 'miragejs';

const { apiVersion } = ENV;

export default function (config) {
  let finalConfig = {
    ...config,
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
