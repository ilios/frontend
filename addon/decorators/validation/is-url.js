import { registerDecorator } from "class-validator";
import { getOwner } from '@ember/application';
import URLValidator from 'validator/es/lib/isURL';

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
          // un-encoded backslashes are not allowed in urls.
          // however, our validation library allows them.
          // @link https://github.com/validatorjs/validator.js/issues/331
          // so we need to check manually here until this gets corrected.
          // [ST 2020/10/21]
          if (value.includes('\\')) {
            return false;
          }
          return URLValidator(value, {
            // eslint-disable-next-line camelcase
            require_protocol: true,
          });
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
