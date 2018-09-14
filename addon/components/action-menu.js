/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import DropdownComponentMixin from 'ember-rl-dropdown/mixins/rl-dropdown-component';
import layout from '../templates/components/action-menu';

export default Component.extend(DropdownComponentMixin, {
  layout,
  title: '',
  icon: 'gear',
  classNames: ['action-menu'],
});
