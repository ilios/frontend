import { registerDecorator } from "class-validator";
import { getOwner } from '@ember/application';

export function Gt(gt, validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: "gt",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [gt],
      options: validationOptions,
      validator: {
        validate(value, { constraints, property }) {
          if (!constraints || constraints.length < 1) {
            throw new Error(`You must pass a ${property} value as the first argument to Gte`);
          }
          const numValue = Number(value);
          if (typeof numValue !== 'number' || isNaN(numValue)) {
            return false;
          }

          const gtValue = Number(constraints[0]);
          if (typeof gtValue !== 'number' || isNaN(gtValue)) {
            throw new Error(`${property} must be a Number`);
          }
          return numValue > gtValue;
        },
        defaultMessage({ constraints, object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const gtValue = constraints[0];
          const description = intl.t('errors.description');
          return intl.t('errors.greaterThan', { description, gt: gtValue });
        }
      },
    });
  };
}
