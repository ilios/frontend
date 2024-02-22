import { registerDecorator } from 'class-validator';
import { DateTime } from 'luxon';
import { getOwner } from '@ember/application';

export function BeforeDate(property, validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: 'beforeDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value, { constraints, object: target, property }) {
          if (!constraints[0]) {
            throw new Error(
              `You must pass the name of a property that ${property} is before as the first argument to BeforeDate`,
            );
          }
          const beforeKey = constraints[0];
          if (!(value instanceof Date)) {
            return false;
          }
          if (!(beforeKey in target)) {
            throw new Error(`${beforeKey} is not a property of this object`);
          }
          const beforeValue = target[beforeKey];
          if (!beforeValue) {
            //allow the before value to be empty
            return true;
          }
          if (!(beforeValue instanceof Date)) {
            throw new Error(`${beforeKey} must be a Date()`);
          }

          const granularity = validationOptions?.granularity ?? 'second';
          return (
            DateTime.fromJSDate(value).startOf(granularity) <
            DateTime.fromJSDate(beforeValue).startOf(granularity)
          );
        },
        defaultMessage({ constraints, object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const beforeKey = constraints[0];
          const beforeValue = target[beforeKey];
          const before = DateTime.fromJSDate(beforeValue);
          const description = intl.t('errors.description');
          const format = validationOptions?.granularity === 'day' ? 'DDD' : 'LLLL d, yyyy, t a';
          const message = intl.t('errors.before', {
            description,
            before: before.toFormat(format),
          });
          return message;
        },
      },
    });
  };
}
