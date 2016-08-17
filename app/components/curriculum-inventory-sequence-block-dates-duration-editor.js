import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component } = Ember;

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
      dependentKeys: ['duration'],
      disabled(){
        return this.get('model.duration') > 0;
      }
    }),
  ],
  endDate: [
    validator('date', {
      dependentKeys: ['startDate', 'duration'],
      after: function () {
        return this.get('model.startDate');
      },
      disabled(){
        return this.get('model.duration') > 0 && !this.get('model.startDate');
      }
    }),
    validator('presence', {
      presence: true,
      dependentKeys: ['startDate', 'duration'],
      disabled(){
        return this.get('model.duration') > 0 && !this.get('model.startDate');
      }
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

  actions: {
    changeStartDate: function(startDate) {
      this.set('startDate', startDate);
    },
    changeEndDate: function(endDate) {
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
