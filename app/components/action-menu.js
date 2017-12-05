/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import DropdownComponentMixin from 'ember-rl-dropdown/mixins/rl-dropdown-component';

export default Component.extend(DropdownComponentMixin, {
  title: '',
  icon: 'gear',
  classNames: ['action-menu'],
});
