import { tracked } from '@glimmer/tracking';
import { getProperties } from '@ember/object';
import { object, setLocale } from 'yup';
import { restartableTask, timeout } from 'ember-concurrency';

const DEBOUNCE_MS = 100;

/**
 * Started with: https://mainmatter.com/blog/2021/12/08/validations-in-ember-apps/
 */
export default class YupValidations {
  context;
  schema;
  shape;

  @tracked error;
  @tracked showAllErrors = false;
  @tracked visibleErrors = [];

  constructor(context, shape) {
    this.context = context;
    this.shape = shape;
    this.schema = object().shape(shape);
  }

  get errorsByKey() {
    return this.error?.errors.reduce((acc, validationError) => {
      const key = validationError.path;

      if (!acc[key]) {
        acc[key] = [validationError];
      } else {
        acc[key].push(validationError);
      }

      return acc;
    }, {});
  }

  get errors() {
    if (!this.errorsByKey) {
      return {};
    }
    if (this.showAllErrors) {
      return this.errorsByKey;
    }

    return getProperties(this.errorsByKey, ...this.visibleErrors);
  }

  runValidator = restartableTask(async () => {
    //wait for user input to stop
    await timeout(DEBOUNCE_MS);
    const rhett = await this.#validate();
    //return the result of the validation and not the promise itself
    return rhett;
  });

  async #validate() {
    try {
      await this.schema.validate(this.#validationProperties(), {
        abortEarly: false,
      });
      this.error = null;
      return true;
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async isValid() {
    return (await this.#validate()) === true;
  }

  addErrorDisplaysFor = (fields) => {
    fields.forEach((field) => this.addErrorDisplayFor(field));
  };

  addErrorDisplayFor = (field) => {
    this.runValidator.perform();
    if (!this.visibleErrors.includes(field)) {
      this.visibleErrors = [...this.visibleErrors, field];
    }
  };
  addErrorDisplayForAllFields = () => {
    this.showAllErrors = true;
  };
  clearErrorDisplay = () => {
    this.showAllErrors = false;
    this.visibleErrors = [];
  };
  removeErrorDisplayFor = (field) => {
    this.showAllErrors = false;
    if (this.visibleErrors.includes(field)) {
      this.visibleErrors = this.visibleErrors.filter((f) => f !== field);
    }
  };

  #validationProperties() {
    return getProperties(this.context, ...Object.keys(this.shape));
  }
}
//call this function to set the error messages and their locale one time when this file is loaded
setupErrorMessages();

function setupErrorMessages() {
  setLocale({
    mixed: {
      required: required(),
    },
    string: {
      min: min(['min']),
      max: max(['max']),
    },
  });
}

function required() {
  return (validationParams) => {
    return {
      path: validationParams.path,
      messageKey: 'errors.blank',
      values: {},
    };
  };
}

function max(localeValues = []) {
  return (validationParams) => {
    return {
      path: validationParams.path,
      messageKey: 'errors.tooLong',
      values: getProperties(validationParams, ...localeValues),
    };
  };
}

function min(localeValues = []) {
  return (validationParams) => {
    return {
      path: validationParams.path,
      messageKey: 'errors.tooShort',
      values: getProperties(validationParams, ...localeValues),
    };
  };
}
