import Ember from 'ember';

export default Ember.ObjectController.extend({
  breadCrumb: Ember.computed.oneWay('model.displayTitle')
});
