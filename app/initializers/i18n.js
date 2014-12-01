import Ember from 'ember';
import Translations from '../translations/en';
export default {
  name: 'i18n',

  initialize: function() {
    Ember.ENV.I18N_COMPILE_WITHOUT_HANDLEBARS = true;
    Ember.FEATURES.I18N_TRANSLATE_HELPER_SPAN = false;
    Ember.I18n.translations = Translations;
    Ember.I18n.locale = 'en';
  }
};
