import Service, { service } from '@ember/service';

export default class GraphqlService extends Service {
  @service fetch;

  async #query(q) {
    const url = `/api/graphql`;
    const headers = this.fetch.authHeaders;
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
    const response = await this.fetch.fetchFromApiHost(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: q }),
    });

    return response.json();
  }

  async find(endpoint, filters, attributes) {
    const filterString = filters.length ? '(' + filters.join(', ') + ')' : '';
    return this.#query(`query { ${endpoint}${filterString} { ${attributes} } }`);
  }
}
