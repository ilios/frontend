import Ember from 'ember';

const { Service, inject, computed } = Ember;
const { service } = inject;
const { reads } = computed;

/**
 * In the LTI app we pull server varialbes out of the session instead
 * of the index.html where it is in the frontend. Instead of using ember-server-variables
 * we can provide this proxy service instead
 * They are needed in the ilios-config service
**/
export default Service.extend({
  session: service(),
  apiHost: reads('session.data.apiHost'),
  apiNameSpace: reads('session.data.apiNameSpace'),
});
