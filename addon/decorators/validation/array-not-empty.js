import { registerDecorator } from "class-validator";
import { getOwner } from '@ember/application';

export function ArrayNotEmpty(validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: 'arrayNotEmpty',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value) {
          if (! Array.isArray(value)) {
            throw `${propertyName} is not an array.`;
          }
          return !!value.length;
        },
        defaultMessage({ object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const description = intl.t('errors.description');
          return intl.t('errors.empty', { description });
        }
      },
    });
  };
}
