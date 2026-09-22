import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { decodedJwtHasLtiAudienceClaims, jwtDecode } from 'ilios-common/utils/jwt-utils';

export default class LtiLoginRoute extends Route {
  @service serverVariables;
  @service session;
  @service router;
  @service fetch;

  async model({ token }) {
    const decodedJwt = jwtDecode(token);
    if (!decodedJwtHasLtiAudienceClaims(decodedJwt)) {
      throw new Error('Access denied');
    }
    const jwt = await this.getNewToken(token);
    await this.session.authenticate('authenticator:ilios-jwt', { jwt });
    this.router.transitionTo('index');
  }

  async getNewToken(ltiToken) {
    const response = await this.fetch.fetchFromApiHost('/auth/token', {
      headers: {
        'X-JWT-Authorization': `Token ${ltiToken}`,
      },
    });
    if (response.ok) {
      const obj = await response.json();
      return obj.jwt;
    } else {
      throw new Error('Unable to extract token from refresh request');
    }
  }
}
