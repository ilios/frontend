import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { inject, Component } = Ember;
const { service } = inject;

const Validations = buildValidations({
  name: [
    validator('presence', true),
    validator('length', {
      max: 60,
      descriptionKey: 'curriculumInventory.reportName'
    })
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),

  init() {
    this._super(...arguments);
    let years = [];
    for (let i = this.currentYear - 5, n = this.currentYear + 5; i <= n; i++) {
      years.push(i);
    }
    this.years = years;
  },

  title: null,
  currentProgram: null,
  isSaving: false,
  currentYear: new Date().getFullYear(),
  selectedYear: null,

  actions: {
    save: function(){
      this.set('isSaving', true);
      this.send('addErrorDisplayFor', 'name');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          let year = parseInt(this.get('selectedYear') || this.get('currentYear'), 10);
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
    cancel: function(){
      this.sendAction('cancel');
    }
  }
});
