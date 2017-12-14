import { typeOf } from '@ember/utils';
import en from "ilios-common/locales/en/translations";
import fr from "ilios-common/locales/fr/translations";
import es from "ilios-common/locales/es/translations";

export function initialize(app) {
  const i18n = app.lookup('service:i18n');
  i18n.addTranslations("en", withFlattenedKeys(en));
  i18n.addTranslations("fr", withFlattenedKeys(fr));
  i18n.addTranslations("es", withFlattenedKeys(es));
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
