import Base from 'ember-validations/validators/base';
import Messages from 'ember-validations/messages';

export default Base.extend({
  call() {
    // Alphanumeric but dashes and colons are allowed
    const regex = /^[a-z0-9-:]+$/i;
    const property = this.model.get(this.property);

    if (property !== '' && !regex.test(property)) {
      this.errors.pushObject(Messages.render('alphanumeric2'));
    }
  }
});
