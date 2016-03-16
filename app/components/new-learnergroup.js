import Ember from 'ember';
import ValidationError from 'ilios/mixins/validation-error';
import EmberValidations from 'ember-validations';

const { Component, computed, inject } = Ember;
const { service } = inject;
const { alias } = computed;

export default Component.extend(ValidationError, EmberValidations, {
  i18n: service(),
  singleMode: true,

  tagName: 'section',
  classNames: ['new-learnergroup', 'new-result', 'form-container'],

  actions: {
    setMode(value) {
      this.set('singleMode', value);
    },
    cancel(){
      this.sendAction('cancel');
    },
    save(title){
      this.sendAction('save', title);
    },
    generateNewLearnerGroups(num){
      this.sendAction('generateNewLearnerGroups', num);
    }
  }
});
