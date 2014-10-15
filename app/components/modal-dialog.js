import Ember from 'ember';
import InboundActions from 'ember-component-inbound-actions/inbound-actions';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, InboundActions, {
  showModal: false,
  actions: {
    toggleVisibility: function(){
      this.toggleProperty('showModal');
    }
  }
});
