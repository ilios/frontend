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
    let jwt;
    if ('jwt' in credentials) {
      jwt = credentials.jwt;
    } else {
      jwt = (await this.loginWithCredentials(credentials, headers)).jwt;
    }

    return this.#extractTokenAndSetupExpiration(jwt);
  }

  async invalidate() {
    cancel(this.#tokenExpirationTimeout);
    this.#tokenExpirationTimeout = null;
  }

  async restore(data) {
    const now = DateTime.now().toUnixInteger();
    const jwt = get(data, 'jwt');
    let exp = get(data, 'exp');

    if (!exp) {
      // Fetch the expire time from the token data since `exp` wasn't included in the data object that was passed in.
      const tokenData = jwtDecode(jwt);
      exp = tokenData['exp'];
    }

    if (exp > now) {
      this.scheduleAccessTokenExpiration(exp);
      return { jwt, exp };
    } else {
      throw new Error('token is expired');
    }
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
    const json = JSON.parse(text);
    if (!response.ok) {
      throw {
        statusText,
        status,
        headers,
        text,
        json,
      };
    }

    const { exp } = jwtDecode(json.jwt);
    return { jwt: json.jwt, exp };
  }

  #extractTokenAndSetupExpiration(jwt) {
    const { exp } = jwtDecode(jwt);
    this.scheduleAccessTokenExpiration(exp);

    return { jwt, exp };
  }
}
