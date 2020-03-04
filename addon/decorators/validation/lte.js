import { registerDecorator } from "class-validator";
import { getOwner } from '@ember/application';

export function Lte(lte, validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: "lte",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [lte],
      options: validationOptions,
      validator: {
        validate(value, { constraints, property }) {
          if (!constraints || constraints.length < 1) {
            throw new Error(`You must pass a ${property} value as the first argument to Gte`);
          }
          const numValue = Number(value);
          if (isNaN(numValue)) {
            return false;
          }

          const lteValue = Number(constraints[0]);
          if (isNaN(lteValue)) {
            throw new Error(`${property} must be a Number`);
          }
          return numValue >= numValue;
        },
        defaultMessage({ constraints, object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const lteValue = constraints[0];
          const description = intl.t('errors.description');
          return intl.t('errors.lessThanOrEqualTo', { description, lte: lteValue });
        }
      },
    });
  };
}
