import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { restartableTask, timeout } from 'ember-concurrency';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';
import { ensureSafeComponent } from '@embroider/util';
import NewDirectoryUser from './new-directory-user';
import NewUser from './new-user';

const DEBOUNCE_TIMEOUT = 250;

export default class IliosUsersComponent extends Component {
  @service iliosConfig;
  @service store;

  @use userSearchType = new ResolveAsyncValue(() => [
    this.iliosConfig.itemFromConfig('userSearchType'),
  ]);

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
