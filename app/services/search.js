import Service, { service } from '@ember/service';

export default class SearchService extends Service {
  @service fetch;

  /**
   * Find courses
   */
  async forCurriculum(q, size, from, schools, years) {
    const schoolQuery = schools ? `&schools=${schools.join('-')}` : '';
    const yearQuery = years ? `&years=${years.join('-')}` : '';
    const url = `/api/search/v2/curriculum?q=${q}&size=${size}&from=${from}${schoolQuery}${yearQuery}`;

    const response = await this.fetch.getFromApiHost(url);
    const { results } = await response.json();

    return results;
  }

  /**
   * Find users
   */
  async forUsers(q, size = 100, onlySuggestEnabled = false) {
    const onlySuggest = onlySuggestEnabled ? '&onlySuggest=true' : '';
    const url = `/api/search/v1/users?q=${q}&size=${size}${onlySuggest}`;

    const response = await this.fetch.getFromApiHost(url);
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
