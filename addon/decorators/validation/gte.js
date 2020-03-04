import { registerDecorator } from "class-validator";
import { getOwner } from '@ember/application';

export function Gte(gte, validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: "gte",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [gte],
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

          const gteValue = Number(constraints[0]);
          if (isNaN(gteValue)) {
            throw new Error(`${property} must be a Number`);
          }
          return numValue >= gteValue;
        },
        defaultMessage({ constraints, object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const gteValue = constraints[0];
          const description = intl.t('errors.description');
          return intl.t('errors.greaterThanOrEqualTo', { description, gte: gteValue });
        }
      },
    });
  };
}
