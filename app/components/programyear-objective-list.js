import { computed } from '@ember/object';
import Component from '@ember/component';
import SortableObjectiveList from 'ilios/mixins/sortable-objective-list';

const { alias, not } = computed;

export default Component.extend(SortableObjectiveList, {
  classNames: ['programyear-objective-list'],
  programYear: alias('subject'),
  editable: not('programYear.locked'),
});
