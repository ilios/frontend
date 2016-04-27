import Ember from 'ember';
import ObjectiveListItem from 'ilios/mixins/objective-list-item';

export default Ember.Component.extend(ObjectiveListItem, {
  course: null,
  editable: true,
});
