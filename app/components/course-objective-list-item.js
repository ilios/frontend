/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import ObjectiveListItem from 'ilios/mixins/objective-list-item';

export default Component.extend(ObjectiveListItem, {
  course: null,
  editable: true,
});
