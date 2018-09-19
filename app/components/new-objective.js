/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const Validations = buildValidations({
  title: [
    validator('html-presence', true),
    validator('length', {
      min: 3,
      max: 65000
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  tagName: 'section',
  classNames: ['new-objective'],

  title: null,
  isSaving: false,

  actions: {
    save() {
      this.set('isSaving', true);
      this.send('addErrorDisplayFor', 'title');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          this.send('removeErrorDisplayFor', 'title');
          return this.save(this.title).finally(() =>{
            this.set('title', null);
          });
        }
      }).finally(() => {
        this.set('isSaving', false);
      });
    },
    changeTitle(contents){
      this.send('addErrorDisplayFor', 'title');
      this.set('title', contents);
    },
  }
});
