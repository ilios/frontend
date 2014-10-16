import Ember from 'ember';

export default Ember.ObjectProxy.extend({
  currentUser: Ember.computed.alias('content')
});
