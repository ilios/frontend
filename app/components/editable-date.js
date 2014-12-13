import Ember from 'ember';
import EditInPlaceMixin from 'ilios/mixins/edit-in-place';

export default Ember.Component.extend(EditInPlaceMixin, {
  date: Ember.computed.oneWay('content'),
  format: 'MM/DD/YY'
});
