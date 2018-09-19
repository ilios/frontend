import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Promise } = RSVP;
const { reads } = computed;

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  commonAjax: service(),
  iliosConfig: service(),
  titleToken: 'general.learningMaterials',

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),
  model(){
    const commonAjax = this.commonAjax;
    const host = this.host;
    const namespace = this.namespace;
    return new Promise(resolve => {
      this.currentUser.get('model').then(user => {
        const userId = user.get('id');
        let url = `${host}/${namespace}/usermaterials/${userId}`;
        commonAjax.request(url).then(data => {
          resolve(data.userMaterials);
        });
      });
    });
  },
});
