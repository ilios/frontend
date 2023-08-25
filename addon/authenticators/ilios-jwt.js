import { get } from '@ember/object';
import { service } from '@ember/service';
import Base from 'ember-simple-auth/authenticators/base';
import jwtDecode from 'ilios-common/utils/jwt-decode';
import { cancel, later } from '@ember/runloop';
import { DateTime } from 'luxon';

export default class IliosJWT extends Base {
  @service iliosConfig;
  #tokenExpirationTimeout = null;

  async authenticate(credentials, headers) {
    if ('jwt' in credentials) {
      return this.#extractTokenAndSetupExpiration(credentials);
    }

    const response = await this.loginWithCredentials(credentials, headers);
    return this.#extractTokenAndSetupExpiration(response.json);
  }

  async invalidate() {
    cancel(this.#tokenExpirationTimeout);
    this.#tokenExpirationTimeout = null;
  }

  restore(data) {
    return new Promise((resolve, reject) => {
      const now = DateTime.now().toUnixInteger();
      const token = get(data, 'jwt');
      let expiresAt = get(data, 'exp');

      if (!token) {
        return reject(new Error('empty token'));
      }

      if (!expiresAt) {
        // Fetch the expire time from the token data since `expiresAt` wasn't included in the data object that was passed in.
        const tokenData = jwtDecode(token);
        expiresAt = tokenData['exp'];
      }

      if (expiresAt > now) {
        this.scheduleAccessTokenExpiration(expiresAt);
        return resolve(data);
      } else {
        return reject(new Error('token is expired'));
      }
    });
  }

  scheduleAccessTokenExpiration(expiresAt) {
    const now = DateTime.now().toUnixInteger();
    const wait = Math.max((expiresAt - now) * 1000, 0);

    cancel(this.#tokenExpirationTimeout);
    this.#tokenExpirationTimeout = null;
    this.#tokenExpirationTimeout = later(
      this,
      async () => {
        await this.invalidate();
        this.trigger('sessionDataInvalidated');
      },
      wait
    );
  }

  async loginWithCredentials(data, loginHeaders) {
    const host = this.iliosConfig.apiHost ? this.iliosConfig.apiHost : '';
    const response = await fetch(`${host}/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...loginHeaders,
      },
      body: JSON.stringify(data),
    });

    const { statusText, status, headers } = response;
    const text = await response.text();
    const res = {
      statusText,
      status,
      headers,
      text,
      json: JSON.parse(text),
    };

    if (!response.ok) {
      throw new Error(res);
    }

    return res;
  }

  #extractTokenAndSetupExpiration(obj) {
    const token = get(obj, 'jwt');
    if (!token) {
      throw new Error('Token is empty. Please check your backend response.');
    }
    const tokenData = jwtDecode(token);
    const expiresAt = get(tokenData, 'exp');

    this.scheduleAccessTokenExpiration(expiresAt);

    return {
      jwt: token,
      exp: expiresAt,
    };
  }
}
