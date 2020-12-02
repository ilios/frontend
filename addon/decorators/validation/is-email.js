import { registerDecorator } from "class-validator";
import { getOwner } from '@ember/application';
import EmailValidator from 'validator/es/lib/isEmail';

export function IsEmail(validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: 'IsEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value) {
          if (! value) {
            return true;
          }
          return EmailValidator(value);
        },
        defaultMessage({ object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const description = intl.t('errors.description');

          return intl.t('errors.email', { description });
        }
      },
    });
  };
}
