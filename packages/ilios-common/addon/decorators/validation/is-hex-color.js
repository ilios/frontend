import { registerDecorator } from 'class-validator';
import { getOwner } from '@ember/application';

const HEX_COLOR_PATTERN = /^#[a-fA-F0-9]{6}$/;

export function IsHexColor(validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: 'IsHexColor',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value) {
          return HEX_COLOR_PATTERN.test(value);
        },
        defaultMessage({ object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const description = intl.t('errors.description');

          return intl.t('errors.invalid', { description });
        },
      },
    });
  };
}
