/* global moment */
import Ember from 'ember';
import layout from '../templates/components/session-offerings';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  layout: layout,
  classNames: ['session-offerings'],
  session: null,
  placeholderValue: t('sessions.titleFilterPlaceholder'),
  offerings: Ember.computed.oneWay('session.offerings'),
  newButtonTitle: t('general.add'),
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
