import { registerDecorator } from "class-validator";
import moment from 'moment';
import { getOwner } from '@ember/application';

export function AfterDate(property, validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: "afterDate",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property, validationOptions ?? 'second'],
      options: validationOptions,
      validator: {
        validate(value, { constraints, object: target, property }) {
          if (!constraints[0]) {
            throw new Error(`You must pass the name of a property that ${property} is after as the first argument to AfterDate`);
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
          return moment(value).isAfter(afterValue, constraints[1]);
        },
        defaultMessage({ constraints, object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const afterKey = constraints[0];
          const afterValue = target[afterKey];
          const after = moment(afterValue);
          const format = constraints[1] === 'day' ? 'LL' : 'LLL';
          const description = intl.t('errors.description');
          const message = intl.t('errors.after', { description, after: after.format(format) });
          return message;
        }
      },
    });
  };
}
