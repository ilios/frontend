import { ValidatorConstraint } from "class-validator";
import moment from 'moment';

@ValidatorConstraint({ name: "beforeDate", async: false })
export class beforeDate {
  validate(value, { constraints, object: target, property }) {
    if (!constraints || constraints.length < 1) {
      throw new Error(`You must pass the name of a property that ${property} is before as the first argument to BeforeDate`);
    }
    const beforeKey = constraints[0];
    if (!(value instanceof Date)) {
      throw new Error(`${property} must be a Date()`);
    }
    if (!(beforeKey in target)) {
      throw new Error(`${beforeKey} is not a property of this object`);
    }
    const beforeValue = target[beforeKey];
    if (!(beforeValue instanceof Date)) {
      throw new Error(`${beforeKey} must be a Date()`);
    }
    return value < beforeValue;
  }

  defaultMessage({ constraints, object: target }) {
    const beforeKey = constraints[0];
    const beforeValue = target[beforeKey];
    const beforeDate = moment(beforeValue);
    return `Must be before ${beforeDate.format('LL')}`;
  }

}
