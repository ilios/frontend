import Route from '@ember/routing/route';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  commonAjax: service(),
  currentUser: service(),
  iliosConfig: service(),

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),

  model() {
    return { materials: this.fetchModelData() };
  },

  async fetchModelData() {
    const commonAjax = this.commonAjax;
    const host = this.host;
    const namespace = this.namespace;
    const user = await this.currentUser.model;
    const url = `${host}/${namespace}/usermaterials/${user.id}`;
    const data = await commonAjax.request(url);
    return data.userMaterials;
  }
});
