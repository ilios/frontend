import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import moment from 'moment';

export default class DashboardCurrentMaterialsComponent extends Component {
  @service currentUser;
  @service fetch;
  @service iliosConfig;

  @tracked materials = null;

  constructor() {
    super(...arguments);
    this.load.perform();
  }

  @restartableTask
  *load() {
    const from = moment().hour(0).minute(0).unix();
    const to = moment().hour(23).minute(59).add(this.args.daysInAdvance, 'days').unix();
    const namespace = this.iliosConfig.apiNameSpace;

    const url = `${namespace}/usermaterials/${this.currentUser.currentUserId}?before=${to}&after=${from}`;
    const data = yield this.fetch.getJsonFromApiHost(url);
    this.materials = data.userMaterials;
  }
  sortString(a, b) {
    return a.localeCompare(b);
  }
}
