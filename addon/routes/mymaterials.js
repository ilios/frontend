import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  fetch: service(),
  currentUser: service(),
  iliosConfig: service(),

  model() {
    return { materials: this.fetchModelData() };
  },

  async fetchModelData() {
    const user = await this.currentUser.getModel();
    const url = `${this.iliosConfig.apiNameSpace}/usermaterials/${user.id}`;
    const data = await this.fetch.getJsonFromApiHost(url);
    return data.userMaterials;
  }
});
