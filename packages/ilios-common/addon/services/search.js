import Service, { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';

export default class SearchService extends Service {
  @service iliosConfig;
  @service session;

  get authHeaders() {
    const session = this.session;
    const { jwt } = session.data.authenticated;
    const headers = {};
    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
    }

    return new Headers(headers);
  }

  get host() {
    return this.iliosConfig.apiHost
      ? this.iliosConfig.apiHost
      : window.location.protocol + '//' + window.location.host;
  }

  /**
   * Find courses
   * @param {string} q
   */
  async forCurriculum(q, onlySuggestEnabled = false, size = 25, from = 0) {
    return this.search('curriculum', q, onlySuggestEnabled, size, from);
  }

  /**
   * Find users
   * @param {string} q
   * @param {number} size
   */
  async forUsers(q, size = 100, from = 0, onlySuggestEnabled = false) {
    const { users, autocomplete } = await this.search('users', q, onlySuggestEnabled, size, from);

    const mappedUsers = users.map((user) => {
      user.fullName = this.getUserFullName(user);

      return user;
    });

    return { autocomplete, users: mappedUsers };
  }

  async search(type, q, onlySuggestEnabled, size, from) {
    const onlySuggest = onlySuggestEnabled ? '&onlySuggest=true' : '';
    const url = `${this.host}/api/search/v1/${type}?q=${q}&size=${size}&from=${from}${onlySuggest}`;

    const response = await waitForPromise(
      fetch(url, {
        headers: this.authHeaders,
      }),
    );
    const { results } = await response.json();

    return results;
  }

  getUserFullName(user) {
    if (user.displayName) {
      return user.displayName;
    }

    if (!user.firstName || !user.lastName) {
      return '';
    }

    const middleInitial = user.middleName ? user.middleName.charAt(0) : false;

    if (middleInitial) {
      return `${user.firstName} ${middleInitial}. ${user.lastName}`;
    } else {
      return `${user.firstName} ${user.lastName}`;
    }
  }
}
