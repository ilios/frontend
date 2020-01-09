import { registerDecorator } from "class-validator";
import { getOwner } from '@ember/application';

export function HtmlNotBlank(validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: 'htmlNotBlank',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value) {
          const text = value || '';
          const noTagsText = text.replace(/(<([^>]+)>)/ig,"");
          const strippedText = noTagsText.replace(/&nbsp;/ig, "").replace(/\s/g, "");

          return strippedText.trim() !== '';
        },
        defaultMessage({ object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const description = intl.t('errors.description');

          return intl.t('errors.blank', { description });
        }
      },
    });
  };
}
