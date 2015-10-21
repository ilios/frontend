import Base from 'ember-validations/validators/base';

export default Base.extend({
  call() {
    const regex = /^[a-z0-9]+$/i;
    const property = this.model.get(this.property);

    if (property !== '' && !regex.test(property)) {
      this.errors.pushObject("must be alphanumeric");
    }
  }
});
