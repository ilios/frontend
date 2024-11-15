import { tracked } from '@glimmer/tracking';
import { getProperties } from '@ember/object';
import { object } from 'yup';

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
        acc[key] = [validationError.message];
      } else {
        acc[key].push(validationError.message);
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

  async validate() {
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

  async validateAndGetErrors() {
    await this.validate();
    return this.errors;
  }

  addErrorDisplaysFor = (fields) => {
    fields.forEach((field) => this.addErrorDisplayFor(field));
  };

  addErrorDisplayFor = (field) => {
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
