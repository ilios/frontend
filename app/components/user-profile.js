import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  currentUser: service(),
  tagName: "",
  canCreate: false,
  canUpdate: false,
  user: null
});
