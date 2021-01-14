import { registerDecorator } from 'class-validator';
import { getOwner } from '@ember/application';

export function GteProp(property, validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: 'gteProp',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value, { constraints, object: target, property }) {
          if (!constraints[0]) {
            throw new Error(
              `You must pass the name of a property that ${property} is after as the first argument to GteProp`
            );
          }
          const compareToProperty = constraints[0];
          const numValue = Number(value);

          if (isNaN(numValue)) {
            return false;
          }

          if (!(compareToProperty in target)) {
            throw new Error(
              `${compareToProperty} is not a property of this object`
            );
          }

          const compareToValue = Number(target[compareToProperty]);

          if (isNaN(compareToValue)) {
            throw new Error(`${compareToProperty} must be a Number.`);
          }
          return numValue >= compareToValue;
        },
        defaultMessage({ constraints, object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const compareToKey = constraints[0];
          const compareToValue = target[compareToKey];
          const description = intl.t('errors.description');
          return intl.t('errors.greaterThanOrEqualTo', {
            description,
            gte: compareToValue,
          });
        },
      },
    });
  };
}
