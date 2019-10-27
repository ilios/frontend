import Service from '@ember/service';
import { inject as service } from '@ember/service';
import fetch from 'fetch';

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
}
