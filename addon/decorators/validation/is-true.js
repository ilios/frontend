import { registerDecorator } from "class-validator";
import { getOwner } from '@ember/application';

export function IsTrue(validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: 'isTrue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value) {
          return value === true;
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
