import Service, { service } from '@ember/service';
import queryString from 'query-string';
import { waitForFetch } from '@ember/test-waiters';

export default class Fetch extends Service {
  @service flashMessages;
  @service intl;
  @service session;
  @service router;
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

  async fetchFromApiHost(relativePath, options) {
    const trimmedPath = relativePath.replace(/^\//, '');
    const path = `${this.host}/${trimmedPath}`;
    const response = await waitForFetch(fetch(path, options));

    // if invalid auth, invalidate session
    if (response.status == 401) {
      this.flashMessages.alert(this.intl.t('errors.invalidAuthentication'));
      this.session.invalidate();
    }

    return response;
  }

  async getFromApiHost(relativePath) {
    return this.fetchFromApiHost(relativePath, {
      headers: this.authHeaders,
    });
  }

  async getJsonFromApiHost(relativePath) {
    const response = await this.getFromApiHost(relativePath);
    return response.json();
  }

  async getFromApi(endpoint) {
    const path = this.#apiPathFromEndpoint(endpoint);
    return this.getFromApiHost(path);
  }

  async postQueryToApi(path, data) {
    const apiPath = this.#apiPathFromEndpoint(path);
    const body = queryString.stringify(data, {
      arrayFormat: 'bracket',
    });
    return this.#postToApiHost(apiPath, body, 'application/x-www-form-urlencoded');
  }

  async postManyToApi(path, items) {
    const apiPath = this.#apiPathFromEndpoint(path);
    const body = JSON.stringify({ data: items });
    return this.#postToApiHost(apiPath, body, 'application/vnd.api+json');
  }

  #apiPathFromEndpoint(endpoint) {
    const trimmedPath = endpoint.replace(/^\//, '');
    return `/${this.iliosConfig.apiNameSpace}/${trimmedPath}`;
  }

  async #postToApiHost(relativePath, body, contentType) {
    const headers = this.authHeaders;
    headers['Content-Type'] = contentType;
    headers['Accept'] = 'application/vnd.api+json';

    const response = await this.fetchFromApiHost(relativePath, {
      method: 'POST',
      headers,
      body,
    });

    return response.json();
  }
}
