import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  flashMessages: service(),
  classNameBindings: [':flash-messages'],
});
