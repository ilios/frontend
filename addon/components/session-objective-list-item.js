/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import ObjectiListItem from 'ilios-common/mixins/objective-list-item';
import layout from '../templates/components/session-objective-list-item';

export default Component.extend(ObjectiListItem, {
  layout,
  session: null,
  classNames: ['session-objective-list-item', 'objective-list-item'],
});
