import Service from '@ember/service';
import fetch from 'fetch';
import { inject as service } from '@ember/service';

export default class GraphqlService extends Service {
  @service session;
  @service iliosConfig;

  get authHeaders() {
    const headers = {};
    if (this.session && this.session.isAuthenticated) {
      const { jwt } = this.session.data.authenticated;
      if (jwt) {
        headers['X-JWT-Authorization'] = `Token ${jwt}`;
      }
    }

    return headers;
  }

  get host() {
    return this.iliosConfig.apiHost
      ? this.iliosConfig.apiHost
      : window.location.protocol + '//' + window.location.host;
  }

  async query(q) {
    const url = `${this.host}/api/graphql`;
    const headers = this.authHeaders;
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: q }),
    });
    return response.json();
  }
}
