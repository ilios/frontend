import { tracked } from '@glimmer/tracking';
import { getProperties } from '@ember/object';
import { object, setLocale } from 'yup';
import { restartableTask, timeout } from 'ember-concurrency';
import { modifier } from 'ember-modifier';

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
      if (!key || !validationError.messageKey) {
        throw new Error(
          `No translation found for validation error: ${validationError}. It needs to be setup in the YupValidations class.`,
        );
      }

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

  makeErrorsVisibleFor = restartableTask(async (fields) => {
    const currentlyInvisible = fields.filter((field) => !this.visibleErrors.includes(field));
    if (currentlyInvisible.length) {
      //wait a tick so we don't double update values that have been used in a render
      await timeout(1);
      this.visibleErrors = [...this.visibleErrors, ...currentlyInvisible];
    }
  });

  async #validate() {
    try {
      await this.schema.validate(this.#validationProperties(), {
        abortEarly: false,
        context: this.context,
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
    this.runValidator.perform();
    this.makeErrorsVisibleFor.perform(fields);
  };

  addErrorDisplayFor = (field) => {
    this.runValidator.perform();
    this.makeErrorsVisibleFor.perform([field]);
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

  attach = modifier((element, [field]) => {
    element.addEventListener(
      'focusout',
      () => {
        this.makeErrorsVisibleFor.perform([field]);
      },
      { passive: true },
    );
    element.addEventListener(
      'input',
      () => {
        this.runValidator.perform();
      },
      { passive: true },
    );
  });
}
//call this function to set the error messages and their locale one time when this file is loaded
setupErrorMessages();

function setupErrorMessages() {
  setLocale({
    mixed: {
      required: required(),
      notType: notType(),
    },
    string: {
      min: min(['min']),
      max: max(['max']),
      email: isEmail(),
      url: isURL(),
    },
    number: {
      integer: isInteger(),
      lessThan: lessThan(),
      min: minimum(),
      moreThan: moreThan(),
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

function isEmail() {
  return (validationParams) => {
    return {
      path: validationParams.path,
      messageKey: 'errors.email',
      values: [],
    };
  };
}

function isURL() {
  return (validationParams) => {
    return {
      path: validationParams.path,
      messageKey: 'errors.url',
      values: [],
    };
  };
}

function notType() {
  return ({ type, path }) => {
    let messageKey,
      values = [];
    switch (type) {
      case 'number':
        messageKey = 'errors.notANumber';
        break;
      default:
        throw new Error(`No translation found for incorrect type: ${type}`);
    }

    return { path, messageKey, values };
  };
}

function moreThan() {
  return (validationParams) => {
    //our current translations expects this key to be named gt and not more as it is in yup
    const gt = validationParams.more;
    return {
      path: validationParams.path,
      messageKey: 'errors.greaterThan',
      values: { gt },
    };
  };
}

function lessThan() {
  return (validationParams) => {
    //our current translations expects this key to be named gt and not more as it is in yup
    const lt = validationParams.less;
    return {
      path: validationParams.path,
      messageKey: 'errors.lessThan',
      values: { lt },
    };
  };
}

function minimum() {
  return (validationParams) => {
    //our current translations expects this key to be named gt and not more as it is in yup
    const min = validationParams.min;
    return {
      path: validationParams.path,
      messageKey: 'errors.minimum',
      values: { min },
    };
  };
}

function isInteger() {
  return (validationParams) => {
    return {
      path: validationParams.path,
      messageKey: 'errors.notAnInteger',
      values: [],
    };
  };
}
