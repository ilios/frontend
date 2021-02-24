import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { restartableTask, timeout } from 'ember-concurrency';

const DEBOUNCE_TIMEOUT = 250;

export default class IliosUsersComponent extends Component {
  @service iliosConfig;
  @service store;
  @tracked newUserComponent = null;

  @restartableTask
  *load() {
    const userSearchType = yield this.iliosConfig.getUserSearchType();
    this.newUserComponent = userSearchType === 'ldap' ? 'new-directory-user' : 'new-user';
    yield this.searchForUsers.perform();
  }

  @restartableTask
  *reload() {
    yield this.searchForUsers.perform();
  }

  @restartableTask
  *searchForUsers() {
    const q = cleanQuery(this.args.query);
    yield timeout(DEBOUNCE_TIMEOUT);
    return this.store.query('user', {
      limit: this.args.limit,
      q,
      offset: this.args.offset,
      'order_by[lastName]': 'ASC',
      'order_by[firstName]': 'ASC'
    });
  }
}
