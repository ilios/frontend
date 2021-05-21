import { registerDecorator } from 'class-validator';
import { getOwner } from '@ember/application';
import { isBlank } from '@ember/utils';

export function Length(min, max, validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: 'length',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [min, max],
      options: validationOptions,
      validator: {
        validate(value, { constraints, property }) {
          const [min, max] = constraints;
          if (min === undefined) {
            throw new Error(
              `You must pass at least a minimum length to the Length validator on ${property}`
            );
          }
          if (isBlank(value)) {
            return true;
          }
          const stringValue = String(value).trim();
          if (max === undefined) {
            return stringValue.length >= min;
          } else {
            return stringValue.length >= min && stringValue.length <= max;
          }
        },
        defaultMessage({ constraints, value, object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          if (isBlank(value)) {
            return true;
          }
          const stringValue = String(value).trim();
          const length = stringValue.length;
          const description = intl.t('errors.description');
          const [min, max] = constraints;
          if (length < min) {
            return intl.t('errors.tooShort', { description, min });
          }
          if (max !== undefined && length > max) {
            return intl.t('errors.tooLong', { description, max });
          }
        },
      },
    });
  };
}
