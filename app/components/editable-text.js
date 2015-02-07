import Ember from 'ember';
import EditInPlaceMixin from 'ilios/mixins/edit-in-place';

export default Ember.Component.extend(EditInPlaceMixin, {
  text: Ember.computed.oneWay('content')
});
