import Ember from 'ember';
import ObjectiListItem from 'ilios/mixins/objective-list-item';

export default Ember.Component.extend(ObjectiListItem, {
  session: null,
  editable: true,
});
