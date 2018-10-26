import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  intl: service(),
  currentUser: service(),
  tagName: 'nav',
  classNameBindings: [':ilios-navigation', 'expanded'],
  expanded: false
});
