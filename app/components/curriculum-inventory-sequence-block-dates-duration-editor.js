/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const { gt, reads } = computed;

const Validations = buildValidations({

  duration: [
    validator('number', {
      allowString: true,
      integer: true,
      gte: 0,
      lte: 1200
    }),
  ],
  startDate: [
    validator('presence', {
      presence: true,
      dependentKeys: ['model.duration'],
      disabled: gt('model.duration', 0)
    }),
  ],
  endDate: [
    validator('date', {
      dependentKeys: ['model.startDate', 'model.duration'],
      after: reads('model.startDate'),
      disabled: computed('model.duration', 'model.startDate', function(){
        return this.get('model.duration') > 0 && !this.get('model.startDate');
      })
    }),
    validator('presence', {
      presence: true,
      dependentKeys: ['model.startDate', 'model.duration'],
      disabled: computed('model.duration', 'model.startDate', function(){
        return this.get('model.duration') > 0 && !this.get('model.startDate');
      })
    }),
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {

  sequenceBlock: null,
  startDate: null,
  endDate: null,
  duration: null,
  isSaving: false,
  classNames: ['curriculum-inventory-sequence-block-dates-duration-editor'],
  tagName: 'section',

  didReceiveAttrs(){
    this._super(...arguments);
    const sequenceBlock = this.get('sequenceBlock');
    const startDate =  sequenceBlock.get('startDate');
    const endDate = sequenceBlock.get('endDate');
    const duration = sequenceBlock.get('duration');
    this.setProperties({ startDate, endDate, duration });
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
  },

  actions: {
    changeStartDate(startDate) {
      this.set('startDate', startDate);
    },
    changeEndDate(endDate) {
      this.set('endDate', endDate);
    },

    save(){
      this.set('isSaving', true);
      this.send('addErrorDisplaysFor', ['duration', 'startDate', 'endDate']);
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          const startDate = this.get('startDate');
          const endDate = this.get('endDate');
          const duration = this.get('duration');
          this.sendAction('save', startDate, endDate, duration);
        } else {
          this.set('isSaving', false);
        }
      });
    },
    cancel(){
      this.sendAction('cancel');
    }
  }
});
