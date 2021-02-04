import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class MymaterialsRoute extends Route {
  @service fetch;
  @service currentUser;
  @service iliosConfig;
  @service session;

  model() {
    return { materials: this.fetchModelData() };
  }

  async fetchModelData() {
    const user = await this.currentUser.getModel();
    const url = `${this.iliosConfig.apiNameSpace}/usermaterials/${user.id}`;
    const data = await this.fetch.getJsonFromApiHost(url);
    return data.userMaterials;
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
