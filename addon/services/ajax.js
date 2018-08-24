import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import AjaxService from 'ember-ajax/services/ajax';

const { reads } = computed;

export default AjaxService.extend({
  iliosConfig: service(),
  session: service(),

  host: reads('iliosConfig.apiHost'),

  headers: computed('session.isAuthenticated', 'session.data.authenticated.jwt', function(){
    const session = this.get('session');
    const { jwt } = session.data.authenticated;
    let headers = {};

    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
    }

    return headers;
  }),

});
