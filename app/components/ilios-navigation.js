import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  intl: service(),
  currentUser: service(),
  tagName: 'nav',
  classNameBindings: [':ilios-navigation', 'expanded'],
  expanded: false,
  attributeBindings: [
    'ariaLabel:aria-label',
  ],
  ariaLabel: computed('intl.locale', function () {
    return this.intl.t('general.primary');
  }),
});
