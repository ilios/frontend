/* global moment */
import Ember from 'ember';
import layout from '../templates/components/session-offerings';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  store: Ember.inject.service(),
  layout: layout,
  classNames: ['session-offerings'],
  session: null,
  placeholderValueTranslation: 'sessions.titleFilterPlaceholder',
  offerings: Ember.computed.oneWay('session.offerings'),
  newButtonTitleTranslation: 'general.add',
  newOfferings: [],
  actions: {
    add: function(){
      var self = this;
      var offering = this.get('store').createRecord('offering', {
        session: self.get('session'),
        startDate: moment().hour(8).minute(0).second(0).format(),
        endDate: moment().hour(9).minute(0).second(0).format(),
      });
      this.get('newOfferings').addObject(offering);
    },
    removeNewOffering: function(offering){
      this.get('newOfferings').removeObject(offering);
    }
  }
});
