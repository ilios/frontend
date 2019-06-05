import Component from '@ember/component';
import { computed } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  minimum: [
    validator('number', {
      allowString: true,
      integer: true,
      gte: 0
    })
  ],
  maximum: [
    validator('number', {
      dependentKeys: ['model.minimum'],
      allowString: true,
      integer: true,
      gte: computed('model.minimum', function() {
        const min = this.get('model.minimum') || 0;
        return Math.max(0, min);
      })
    })
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  classNames: ['curriculum-inventory-sequence-block-min-max-editor'],
  tagName: 'section',

  isSaving: false,
  maximum: null,
  minimum: null,
  sequenceBlock: null,

  didReceiveAttrs() {
    this._super(...arguments);
    const sequenceBlock = this.sequenceBlock;
    const minimum =  sequenceBlock.get('minimum');
    const maximum = sequenceBlock.get('maximum');
    this.setProperties({ minimum, maximum });
  },

  actions: {
    save() {
      this.set('isSaving', true);
      this.send('addErrorDisplaysFor', ['minimum', 'maximum']);
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          const min = this.minimum;
          const max = this.maximum;
          this.save(min, max);
        } else {
          this.set('isSaving', false);
        }
      });
    },

    cancel() {
      this.cancel();
    }
  },

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.send('save');
      return;
    }

    if (27 === keyCode) {
      this.send('cancel');
    }
  }
});
