import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import { inject as service } from '@ember/service';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  name: [
    validator('presence', {
      presence: true
    }),
    validator('length', {
      max: 100
    }),
  ],
  aamcCode: [
    validator('number', {
      allowString: true,
      integer: true,
      gte: 1,
      lte: 99999
    })
  ],
  addressStreet: [
    validator('presence', {
      presence: true
    }),
    validator('length', {
      max: 100
    }),
  ],
  addressCity: [
    validator('presence', {
      presence: true
    }),
    validator('length', {
      max: 100
    }),
  ],
  addressStateOrProvince: [
    validator('presence', {
      presence: true
    }),
    validator('length', {
      max: 50
    }),
  ],
  addressZipCode: [
    validator('presence', {
      presence: true
    }),
    validator('length', {
      max: 10
    }),
  ],
  addressCountryCode: [
    validator('presence', {
      presence: true
    }),
    validator('length', {
      max: 2
    }),
  ],
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  store: service(),
  "data-test-school-curriculum-inventory-institution-manager": true,
  classNames: ["school-curriculum-inventory-institution-manager"],
  isSaving: false,
  name: null,
  aamcCode: null,
  addressStreet: null,
  addressCity: null,
  addressStateOrProvince: null,
  addressZipCode: null,
  addressCountryCode: null,

  didReceiveAttrs(){
    this._super(...arguments);
    if (isPresent(this.institution)) {
      this.setProperties({
        "name": this.institution.get("name"),
        "aamcCode": this.institution.get("aamcCode"),
        "addressStreet": this.institution.get("addressStreet"),
        "addressCity": this.institution.get("addressCity"),
        "addressStateOrProvince": this.institution.get("addressStateOrProvince"),
        "addressZipCode": this.institution.get("addressZipCode"),
        "addressCountryCode": this.institution.get("addressCountryCode")
      });
    } else {
      this.setProperties({
        "name": "",
        "aamcCode": "",
        "addressStreet": "",
        "addressCity": "",
        "addressStateOrProvince": "",
        "addressZipCode": "",
        "addressCountryCode": ""
      });
    }
  },

  actions: {
    async save() {
      this.set('isSaving', true);
      this.send('addErrorDisplaysFor', [
        'name',
        'aamcCode',
        'addressStreet',
        'addressCity',
        'addressStateOrProvince',
        'addressZipCode',
        'addressCountryCode',
      ]);
      let {validations} = await this.validate();
      if (validations.get('isInvalid')) {
        this.set('isSaving', false);
        return;
      }
      let institution = this.institution;
      if (! isPresent(institution)) {
        institution = this.store.createRecord('curriculum-inventory-institution');
      }
      institution.set("name", this.name);
      institution.set("aamcCode", this.aamcCode);
      institution.set("addressStreet", this.addressStreet);
      institution.set("addressCity", this.addressCity);
      institution.set("addressStateOrProvince", this.addressStateOrProvince);
      institution.set("addressZipCode", this.addressZipCode);
      institution.set("addressCountryCode", this.addressCountryCode);
      await this.get("save")(institution);
      this.send('clearErrorDisplay');
      this.set('isSaving', false);
      this.manage(false);
    },
    cancel() {
      this.manage(false);
    }
  }
});
