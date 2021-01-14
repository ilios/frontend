import { registerDecorator } from 'class-validator';

export function Custom(
  validatorCallbackName,
  messageCallbackName,
  validationOptions
) {
  return function (object, propertyName) {
    registerDecorator({
      name: 'custom',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [validatorCallbackName, messageCallbackName],
      options: validationOptions,
      validator: {
        async validate(value, { constraints, object: target }) {
          return await target[constraints[0]]();
        },

        defaultMessage({ constraints, object: target }) {
          return target[constraints[1]]();
        },
      },
    });
  };
}
