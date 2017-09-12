import Ember from 'ember';

const { readOnly } = Ember.computed;

export default Ember.Component.extend({
  editable: readOnly('extra.editable'),
});
