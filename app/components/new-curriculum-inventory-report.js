import Component from '@ember/component';
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

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
  store: service(),

  classNames: ['new-curriculum-inventory-report'],

  currentProgram: null,
  isSaving: false,
  selectedYear: null,
  title: null,
  years: null,

  didReceiveAttrs() {
    this._super(...arguments);
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5, n = currentYear + 5; i <= n; i++) {
      const title = i + ' - ' + (i + 1);
      const year = EmberObject.create({ 'id': i, 'title': title });
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
          const year = parseInt(this.selectedYear.get('id'), 10);
          const report = this.store.createRecord('curriculumInventoryReport', {
            name: this.name,
            program: this.currentProgram,
            year: year,
            startDate: new Date(year, 6, 1),
            endDate: new Date(year +  1, 5, 30),
            description: this.description
          });
          this.save(report).finally(()=>{
            this.set('isSaving', false);
          });
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
