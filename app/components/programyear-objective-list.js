/* eslint ember/order-in-components: 0 */
import { computed } from '@ember/object';
import Component from '@ember/component';
import SortableObjectiveList from 'ilios/mixins/sortable-objective-list';

const { alias } = computed;

export default Component.extend(SortableObjectiveList, {
  classNames: ['programyear-objective-list'],
  programYear: alias('subject'),
  editable: false,
});
