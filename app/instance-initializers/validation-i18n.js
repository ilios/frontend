import Ember from 'ember';
import ValidationMessages from 'ember-validations/messages';

export function initialize(instance) {
  Ember.I18n = instance.container.lookup('service:i18n');

  ValidationMessages.render = function(attribute, context) {
    return this.replaceRegex(Ember.I18n.t('errors.' + attribute, context), context);
  };

  ValidationMessages.replaceRegex = function(text, context) {
    var regex = new RegExp('{{(.*?)}}'),
        attributeName = '',
        result = text;

    while (regex.test(result)) {
      attributeName = regex.exec(result)[1];
      result = result.replace(regex, context[attributeName]);
    }

    return result;
  };
}

export default {
  name: 'validation-i18n',
  initialize: initialize
};
