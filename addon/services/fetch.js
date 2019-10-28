import Service from '@ember/service';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import queryString from 'query-string';

export default class Fetch extends Service {
  @service session;
  @service iliosConfig;

  get authHeaders() {
    let headers = {};
    if (this.session && this.session.isAuthenticated) {
      const { jwt } = this.session.data.authenticated;
      if (jwt) {
        headers['X-JWT-Authorization'] = `Token ${jwt}`;
      }
    }

    return headers;
  }

  get host() {
    return this.iliosConfig.apiHost ? this.iliosConfig.apiHost : window.location.protocol + '//' + window.location.host;
  }

  apiHostUrlFromPath(relativePath) {
    const trimmedPath = relativePath.replace(/^\//, "");
    return `${this.host}/${trimmedPath}`;
  }

  async getJsonFromApiHost(relativePath) {
    const url = this.apiHostUrlFromPath(relativePath);
    const response = await fetch(url, {
      headers: this.authHeaders
    });
    return response.json();
  }

  async postToApiHost(relativePath, data) {
    const url = this.apiHostUrlFromPath(relativePath);
    let headers = this.authHeaders;
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    const body = queryString.stringify(data, {
      arrayFormat: 'bracket',
    });
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });
    return response.json();
  }
}
