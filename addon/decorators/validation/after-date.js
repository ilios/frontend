import { registerDecorator } from "class-validator";
import moment from 'moment';
import { getOwner } from '@ember/application';

export function AfterDate(property, validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: "afterDate",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value, { constraints, object: target, property }) {
          if (!constraints || constraints.length < 1) {
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
          if (!(afterValue instanceof Date)) {
            throw new Error(`${afterKey} must be a Date()`);
          }
          return value > afterValue;
        },
        defaultMessage({ constraints, object: target }) {
          const owner = getOwner(target);
          const intl = owner.lookup('service:intl');
          const afterKey = constraints[0];
          const afterValue = target[afterKey];
          const after = moment(afterValue);
          const description = intl.t('errors.description');
          const message = intl.t('errors.after', { description, after: after.format('LL') });
          return message;
        }
      },
    });
  };
}
