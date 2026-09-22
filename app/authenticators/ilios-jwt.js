import { service } from '@ember/service';
import Base from 'ember-simple-auth/authenticators/base';
import { jwtDecode } from 'ilios-common/utils/jwt-utils';
import { cancel, later } from '@ember/runloop';
import { DateTime } from 'luxon';

export default class IliosJWT extends Base {
  @service fetch;
  #tokenExpirationTimeout = null;

  async authenticate(credentials) {
    if (!credentials.jwt) {
      throw new Error('JWT missing from credentials');
    }

    return this.#extractTokenAndSetupExpiration(credentials.jwt);
  }

  async invalidate() {
    // eslint-disable-next-line ember/no-runloop
    cancel(this.#tokenExpirationTimeout);
    this.#tokenExpirationTimeout = null;
  }

  async restore(data) {
    const now = DateTime.now().toUnixInteger();
    let { jwt, exp } = data;

    if (!exp) {
      // Fetch the expiration time from the token data since `exp` wasn't included in the data object that was passed in.
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

    // eslint-disable-next-line ember/no-runloop
    cancel(this.#tokenExpirationTimeout);
    this.#tokenExpirationTimeout = null;
    // eslint-disable-next-line ember/no-runloop
    this.#tokenExpirationTimeout = later(
      this,
      async () => {
        await this.invalidate();
        this.trigger('sessionDataInvalidated');
      },
      wait,
    );
  }

  #extractTokenAndSetupExpiration(jwt) {
    const { exp } = jwtDecode(jwt);
    this.scheduleAccessTokenExpiration(exp);

    return { jwt, exp };
  }
}
