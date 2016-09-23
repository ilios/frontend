import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';

const { inject, computed } = Ember;
const { service } = inject;
const { reads } = computed;

export default AjaxService.extend({
  serverVariables: service(),
  session: service(),

  host: reads('serverVariables.apiHost'),

  headers: computed('session.isAuthenticated', function(){
    let headers = {};
    this.get('session').authorize('authorizer:token', (headerName, headerValue) => {
      headers[headerName] = headerValue;
    });

    return headers;
  }),

});
