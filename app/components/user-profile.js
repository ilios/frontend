import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  currentUser: service(),

  classNames: ['user-profile'],

  'data-test-user-profile': true,

  canCreate: false,
  canUpdate: false,
  user: null
});
