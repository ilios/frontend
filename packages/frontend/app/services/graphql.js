import Service, { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { task } from 'ember-concurrency';

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

  async #query(q) {
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

  async find(endpoint, filters, attributes) {
    const filterString = filters.length ? '(' + filters.join(', ') + ')' : '';
    return waitForPromise(this.#query(`query { ${endpoint}${filterString} { ${attributes} } }`));
  }

  findTask = task(async (endpoint, filters, attributes, signal) => {
    const filterString = filters.length ? '(' + filters.join(', ') + ')' : '';
    const url = `${this.host}/api/graphql`;
    const headers = this.authHeaders;
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
    const q = `query { ${endpoint}${filterString} { ${attributes} } }`;

    let response = null;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: q }),
        signal,
      });

      return response.json();
    } catch (e) {
      if (signal.aborted) {
        if (signal.reason) {
          console.log(`graphql canceled with reason: ${signal.reason}`);
        } else {
          console.warn('graphql canceled but no reason was given.');
        }
      } else {
        console.error('graphql failed due to unknown error', e);
      }

      return {
        error: 'bad stuff',
      };
    } finally {
      console.log('graphql completed');
    }
  });
}
