import { registerDecorator } from 'class-validator';
import { DateTime } from 'luxon';
import { getOwner } from '@ember/application';

export function AfterDate(property, validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: 'afterDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value, { constraints, object: target, property }) {
          if (!constraints[0]) {
            throw new Error(
              `You must pass the name of a property that ${property} is after as the first argument to AfterDate`,
            );
          }
          const afterKey = constraints[0];
          if (!(value instanceof Date)) {
            return false;
          }
          if (!(afterKey in target)) {
            throw new Error(`${afterKey} is not a property of this object`);
          }
          const afterValue = target[afterKey];
          if (!afterValue) {
            //allow the after value to be empty
            return true;
          }
          if (!(afterValue instanceof Date)) {
            throw new Error(`${afterKey} must be a Date()`);
          }

          const granularity = validationOptions?.granularity ?? 'second';
          return (
            DateTime.fromJSDate(value).startOf(granularity) >
            DateTime.fromJSDate(afterValue).startOf(granularity)
          );
        },
        defaultMessage({ constraints, object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const afterKey = constraints[0];
          const afterValue = target[afterKey];
          const after = DateTime.fromJSDate(afterValue);
          const format = validationOptions?.granularity === 'day' ? 'DDD' : 'LLLL d, yyyy, t a';
          const description = intl.t('errors.description');
          const message = intl.t('errors.after', {
            description,
            after: after.toFormat(format),
          });
          return message;
        },
      },
    });
  };
}
