import { registerDecorator } from "class-validator";
import { getOwner } from '@ember/application';

export function IsInt(validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: 'IsInt',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value) {
          const numValue = Number(value);
          if (Number.isInteger) {
            return Number.isInteger(numValue);
          }
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
          return typeof value === 'number' &&
            isFinite(numValue) &&
            Math.floor(numValue) === numValue;
        },
        defaultMessage({ object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const description = intl.t('errors.description');

          return intl.t('errors.notAnInteger', { description });
        }
      },
    });
  };
}
