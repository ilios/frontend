import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class MymaterialsRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service fetch;
  @service currentUser;
  @service iliosConfig;

  model() {
    return { materials: this.fetchModelData() };
  }

  async fetchModelData() {
    const user = await this.currentUser.getModel();
    const url = `${this.iliosConfig.apiNameSpace}/usermaterials/${user.id}`;
    const data = await this.fetch.getJsonFromApiHost(url);
    return data.userMaterials;
  }
}
