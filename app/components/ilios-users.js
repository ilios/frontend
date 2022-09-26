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
  @tracked userSearchType = null;

  load = restartableTask(async () => {
    this.userSearchType = await this.iliosConfig.getUserSearchType();
    this.newUserComponent = this.userSearchType === 'ldap' ? 'new-directory-user' : 'new-user';
    await this.searchForUsers.perform();
  });

  reload = restartableTask(async () => {
    await this.searchForUsers.perform();
  });

  searchForUsers = restartableTask(async () => {
    const q = cleanQuery(this.args.query);
    await timeout(DEBOUNCE_TIMEOUT);
    return this.store.query('user', {
      limit: this.args.limit,
      q,
      offset: this.args.offset,
      'order_by[lastName]': 'ASC',
      'order_by[firstName]': 'ASC',
    });
  });
}
