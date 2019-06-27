import Service from '@ember/service';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Service.extend({
  iliosConfig: service(),
  session: service(),

  authHeaders: computed('session.isAuthenticated', function(){
    const session = this.session;
    const { jwt } = session.data.authenticated;
    let headers = {};
    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
    }

    return new Headers(headers);
  }),

  host: computed('iliosConfig.apiHost', function () {
    return this.iliosConfig.apiHost ? this.iliosConfig.apiHost : window.location.protocol + '//' + window.location.host;
  }),

  /**
   * Find courses
   * @param {string} q
   */
  async forCurriculum(q) {
    const { results: { courses } } = await this.search('curriculum', q, 1000);

    return courses;
  },

  /**
   * Find users
   * @param {string} q
   * @param {number} size
   */
  async forUsers(q, size = 100) {
    const { results: { users } } = await this.search('users', q, size);

    return users.map(user => {
      user.fullName = this.getUserFullName(user);

      return user;
    });
  },

  async search(type, q, size) {
    const url = `${this.host}/search/v1/${type}?q=${q}&size=${size}`;
    const response = await fetch(url, {
      headers: this.authHeaders
    });
    return response.json();
  },

  getUserFullName(user) {
    if (user.displayName) {
      return user.displayName;
    }

    if (!user.firstName || !user.lastName) {
      return '';
    }

    const middleInitial = user.middleName?user.middleName.charAt(0):false;

    if (middleInitial) {
      return `${user.firstName} ${middleInitial}. ${user.lastName}`;
    } else {
      return `${user.firstName} ${user.lastName}`;
    }
  },
});
