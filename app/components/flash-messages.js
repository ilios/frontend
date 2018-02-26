import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  flashMessages: service(),
  classNameBindings: [':flash-messages', 'hidden'],
  hidden: computed('flashMessages.isEmpty', function () {
    const flashMessages = this.get('flashMessages');
    return flashMessages.get('isEmpty');
  }),
});
