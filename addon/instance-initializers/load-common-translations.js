import Ember from 'ember';
import en from "ilios-common/locales/en/translation";
const { typeOf } = Ember;

export function initialize({ container }) {
  const i18n = container.lookup('service:i18n');
  i18n.addTranslations("en", withFlattenedKeys(en));
}

function withFlattenedKeys(object) {
  const result = {};

  Object.keys(object).forEach(function(key) {
    var value = object[key];

    if (typeOf(value) === 'object') {
      value = withFlattenedKeys(value);

      Object.keys(value).forEach(function(suffix) {
        result[`${key}.${suffix}`] = value[suffix];
      });
    } else {
      result[key] = value;
    }
  });

  return result;
}

export default {
  name: 'load-common-translations',
  initialize
};
