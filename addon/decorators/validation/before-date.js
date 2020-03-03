import { registerDecorator } from "class-validator";
import moment from 'moment';
import { getOwner } from '@ember/application';

export function BeforeDate(property, validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: "beforeDate",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value, { constraints, object: target, property }) {
          if (!constraints[0]) {
            throw new Error(`You must pass the name of a property that ${property} is before as the first argument to BeforeDate`);
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
          return moment(value).isBefore(beforeValue, validationOptions?.granularity ?? 'second');
        },
        defaultMessage({ constraints, object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const beforeKey = constraints[0];
          const beforeValue = target[beforeKey];
          const before = moment(beforeValue);
          const description = intl.t('errors.description');
          const format = validationOptions?.granularity === 'day' ? 'LL' : 'LLL';
          const message = intl.t('errors.before', { description, before: before.format(format) });
          return message;
        }
      },
    });
  };
}
