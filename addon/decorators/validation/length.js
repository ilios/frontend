import { registerDecorator } from "class-validator";
import { getOwner } from '@ember/application';

export function Length(min, max, validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: "length",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [min, max],
      options: validationOptions,
      validator: {
        validate(value, { constraints, property }) {
          if (!constraints || constraints.length < 2) {
            throw new Error(`You must pass a min and max length to the Length validator on ${property}`);
          }
          value = value || '';
          value = value.trim();
          if (!value) {
            return true;
          }
          const [min, max] = constraints;
          return value.length >= min && value.length <= max;
        },
        defaultMessage({ constraints, value, object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');

          const [min, max] = constraints;
          const stringValue = value ?? '';
          const length = stringValue.length;
          const description = intl.t('errors.description');
          if (length < min) {
            return intl.t('errors.tooShort', { description, min });
          }
          if (length > max) {
            return intl.t('errors.tooLong', { description, max });
          }
        }
      },
    });
  };
}
