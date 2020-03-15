import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { validate } from "class-validator";

export function validatable(target) {
  return class extends target {
    @tracked _evdVisibleErrors = [];
    @tracked _evdShowAllErrors = false;

    @action
    async validate() {
      const errors = await validate(this);
      const errorsByField = errors.reduce((acc, { property, constraints }) => {
        acc[property] = Object.values(constraints);
        return acc;
      }, {});
      errorsByField._hasErrors = errors.length > 0;
      return errorsByField;
    }
    @action
    async isValid(field = null) {
      return !(await this.isInvalid(field));
    }
    @action
    async isInvalid(field = null) {
      const errors = await this.validate();
      if (field === null) {
        return errors._hasErrors;
      }
      return (field in errors);
    }
    @action
    async getErrorsFor(field) {
      if (this._evdShowAllErrors || this._evdVisibleErrors.includes(field)) {
        const errors = await this.validate();
        if (field in errors) {
          return errors[field];
        }
      }

      return [];
    }
    @action
    async hasErrorFor(field) {
      const errors = await this.getErrorsFor(field);
      return errors.length > 0;
    }

    @action
    addErrorDisplaysFor(fields) {
      fields.forEach(field => this.addErrorDisplayFor(field));
    }

    @action
    addErrorDisplayFor(field) {
      if (!this._evdVisibleErrors.includes(field)) {
        this._evdVisibleErrors = [...this._evdVisibleErrors, field];
      }
    }
    @action
    addErrorDisplayForAllFields() {
      this._evdShowAllErrors = true;
    }
    @action
    clearErrorDisplay() {
      this._evdShowAllErrors = false;
      this._evdVisibleErrors = [];
    }
    removeErrorDisplayFor(field) {
      if (this._evdVisibleErrors.includes(field)) {
        this._evdShowAllErrors = false;
        this._evdVisibleErrors = this._evdVisibleErrors.filter(f => f !== field);
      }
    }
  };
}
