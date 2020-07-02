import { registerDecorator } from "class-validator";
import { getOwner } from '@ember/application';
import testURL from "is-url";

export function IsURL(validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: 'IsURL',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value) {
          if (!value) {
            return true;
          }
          return testURL(value);
        },
        defaultMessage({ object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const description = intl.t('errors.description');

          return intl.t('errors.url', { description });
        }
      },
    });
  };
}
