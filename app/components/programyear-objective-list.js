import Ember from 'ember';
import SortableObjectiveList from 'ilios/mixins/sortable-objective-list';

const { computed, Component } = Ember;
const { alias, not } = computed;

export default Component.extend(SortableObjectiveList, {
  classNames: ['programyear-objective-list'],
  programYear: alias('subject'),
  editable: not('programYear.locked'),
});
