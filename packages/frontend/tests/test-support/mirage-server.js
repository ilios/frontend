import commonRoutes from './mirage/routes';
import commonModels from './mirage/models';
import commonFactories from './mirage/factories';
import applicationSerializer from './mirage/serializers/application';
import ENV from 'frontend/config/environment';
import { createServer, Response } from 'miragejs';
import { DateTime } from 'luxon';
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
      this.timing = 100;
      this.namespace = '/';
      commonRoutes(this);
      this.post('auth/login', function (schema, request) {
        const errors = [];
        var attrs = JSON.parse(request.requestBody);
        if (!('username' in attrs) || !attrs.username) {
          errors.push('missingUsername');
        }
        if (!('password' in attrs) || !attrs.password) {
          errors.push('missingPassword');
        }
        const username = attrs.username.toLowerCase();
        if (errors.length === 0) {
          if (username === 'demo' && attrs.password === 'demo') {
            const now = DateTime.now();
            const nextWeek = now.plus({ weeks: 1 });
            const header = '{"alg":"none"}';
            const body = `{"iss": "ilios","aud": "ilios","iat": "${now.toUnixInteger()}","exp": "${nextWeek.toUnixInteger()}","user_id": 4136}`;

            const encodedData = window.btoa(header) + '.' + window.btoa(body) + '.';
            return {
              jwt: encodedData,
            };
          } else {
            errors.push('badCredentials');
          }
        }
        return new Response(400, {}, { errors: errors });
      });

      this.get('auth/logout', function () {
        return new Response(200);
      });

      this.get('auth/whoami', function () {
        return {
          userId: 4136,
        };
      });

      this.get('application/config', function () {
        return {
          config: {
            type: 'form',
            apiVersion,
            appVersion: '1.2.3',
            materialStatusEnabled: true,
            showCampusNameOfRecord: true,
          },
        };
        // return { config: {
        //   type: 'shibboleth',
        //   shibbolethLoginUrl: '/fakeshiblogin'
        // }};
      });

      this.get('auth/token', function () {
        //un comment to send unauthenticated user data
        // return {
        //   jwt: null
        // };
        const now = DateTime.now();
        const nextWeek = now.plus({ weeks: 1 });
        const header = '{"alg":"none"}';
        const body = `{"iss": "ilios","aud": "ilios","iat": "${now.toUnixInteger()}","exp": "${nextWeek.toUnixInteger()}","user_id": 4136}`;

        const encodedData = window.btoa(header) + '.' + window.btoa(body) + '.';
        return {
          jwt: encodedData,
        };
      });

      this.post('errors', function () {
        //doesn't do anything, just swallows errors
      });
      this.passthrough('/assets/*');
    },
  };

  return createServer(finalConfig);
}
