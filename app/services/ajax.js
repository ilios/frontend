import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';

const { service } = Ember.inject;

export default AjaxService.extend({
  session: service(),
  headers: Ember.computed('session', {
    get() {
      let headers = {};
      this.get('session').authorize('authorizer:token', (headerName, headerValue) => {
        headers[headerName] = headerValue;
      });
      
      return headers;
    }
  }),
  
});
