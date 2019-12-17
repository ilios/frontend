import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';
import moment from 'moment';

export default class DashboardMaterialsComponent extends Component {
  @service currentUser;
  @service fetch;
  @service iliosConfig;

  @tracked daysInAdvance = 60;
  @tracked materials = null;

  @restartableTask
  *load() {
    const from = moment().hour(0).minute(0).unix();
    const to = moment().hour(23).minute(59).add(this.daysInAdvance, 'days').unix();
    const namespace = this.iliosConfig.apiNameSpace;

    const url = `${namespace}/usermaterials/${this.currentUser.currentUserId}?before=${to}&after=${from}`;
    const data = yield this.fetch.getJsonFromApiHost(url);
    this.materials = data.userMaterials;
  }
  sortString(a, b){
    return a.localeCompare(b);
  }
}
