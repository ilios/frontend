import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { restartableTask, timeout } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { ensureSafeComponent } from '@embroider/util';
import NewDirectoryUser from './new-directory-user';
import NewUser from './new-user';

const DEBOUNCE_TIMEOUT = 250;

export default class IliosUsersComponent extends Component {
  @service iliosConfig;
  @service store;
  searchTypeConfig = new TrackedAsyncData(this.iliosConfig.itemFromConfig('userSearchType'));

  @cached
  get userSearchType() {
    return this.searchTypeConfig.isResolved ? this.searchTypeConfig.value : null;
  }

  get newUserComponent() {
    const component = this.userSearchType === 'ldap' ? NewDirectoryUser : NewUser;
    return ensureSafeComponent(component, this);
  }

  @restartableTask
  *load() {
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
      'order_by[firstName]': 'ASC',
    });
  }
}
