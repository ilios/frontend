/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import ObjectiveListItem from 'ilios-common/mixins/objective-list-item';
import layout from '../templates/components/course-objective-list-item';

export default Component.extend(ObjectiveListItem, {
  layout,
  course: null,
  classNames: ['course-objective-list-item', 'objective-list-item'],
});
