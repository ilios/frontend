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
   */
  async forCurriculum(q, size, from, schools, years) {
    const schoolQuery = schools ? `&schools=${schools.join('-')}` : '';
    const yearQuery = years ? `&years=${years.join('-')}` : '';
    const url = `${this.host}/api/search/v2/curriculum?q=${q}&size=${size}&from=${from}${schoolQuery}${yearQuery}`;

    const response = await waitForPromise(
      fetch(url, {
        headers: this.authHeaders,
      }),
    );
    const { results } = await response.json();

    return results;
  }

  /**
   * Find users
   */
  async forUsers(q, size = 100, onlySuggestEnabled = false) {
    const onlySuggest = onlySuggestEnabled ? '&onlySuggest=true' : '';
    const url = `${this.host}/api/search/v1/users?q=${q}&size=${size}${onlySuggest}`;

    const response = await waitForPromise(
      fetch(url, {
        headers: this.authHeaders,
      }),
    );
    const { results } = await response.json();

    const { users, autocomplete } = results;

    const mappedUsers = users.map((user) => {
      user.fullName = this.getUserFullName(user);

      return user;
    });

    return { autocomplete, users: mappedUsers };
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
