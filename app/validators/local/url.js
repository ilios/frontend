import Base from 'ember-validations/validators/base';
import Messages from 'ember-validations/messages';

export default Base.extend({
  call() {
    const property = this.model.get(this.property);

    if (property !== '' && property === 'http://') {
      this.errors.pushObject(Messages.render('url'));
    }
  }
});
