import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component } = Ember;

const Validations = buildValidations({
  name: [
    validator('presence', true),
    validator('length', {
      max: 60,
      descriptionKey: 'general.reportName'
    })
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: Ember.inject.service(),
  title: null,
  currentProgram: null,
  isSaving: false,
  selectedYear: null,
  years: [],

  didReceiveAttrs(){
    this._super(...arguments);
    let years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5, n = currentYear + 5; i <= n; i++) {
      let title = i + ' - ' + (i + 1);
      let year = Ember.Object.create({ 'id': i, 'title': title });
      years.pushObject(year);
    }
    const selectedYear = years.findBy('id', currentYear);
    this.setProperties({
      years,
      selectedYear,
      isSaving: false,
    });
  },

  actions: {
    save() {
      this.set('isSaving', true);
      this.send('addErrorDisplayFor', 'name');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          let year = parseInt(this.get('selectedYear').get('id'), 10);
          let report = this.get('store').createRecord('curriculumInventoryReport', {
            name: this.get('name'),
            program: this.get('currentProgram'),
            year: year,
            startDate: new Date(year, 6, 1),
            endDate: new Date(year +  1, 5, 30),
            description: this.get('description')
          });
          this.get('save')(report).finally(()=>{
            this.set('isSaving', false);
          });
        } else {
          this.set('isSaving', false);
        }
      });
    },
    cancel() {
      this.sendAction('cancel');
    },
  }
});
