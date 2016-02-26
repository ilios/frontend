import Ember from 'ember';
import EmberValidations, { validator as emberValidator } from 'ember-validations';
import validator from 'npm:validator';

const { Component, computed, inject } = Ember;
const { sort } = computed;
const { service } = inject;

export default Component.extend(EmberValidations, {
  store: service(),
  i18n: service(),
  schools: [],
  newSchools: [],
  showErrorsFor: [],
  title: null,
  iliosAdministratorEmail: null,
  isSavingNewSchool: false,
  validations: {
    'title': {
      presence: true,
      length: { maximum: 60 }
    },
    'iliosAdministratorEmail': {
      presence: true,
      length: { maximum: 100 },
      inline: emberValidator(function() {
        const email = this.model.get('iliosAdministratorEmail');
        if (!validator.isEmail(email)) {
          return this.model.get('i18n').t('errors.email');
        }
      }),
    },
  },

  sortSchoolsBy: ['title'],
  sortedSchools: sort('schools', 'sortSchoolsBy'),
  showNewSchoolForm: false,
  actions: {
    toggleNewSchoolForm(){
      this.set('showNewSchoolForm', !this.get('showNewSchoolForm'));
    },
    hideNewSchoolForm(){
      this.set('showNewSchoolForm', false);
      this.set('title', null);
    },
    addErrorDisplayFor(field){
      let showErrorsFor = this.get('showErrorsFor');
      if (!showErrorsFor.contains(field)) {
        showErrorsFor.pushObject(field);
      }
    },
    createNewSchool(){
      this.send('addErrorDisplayFor', 'title');
      this.send('addErrorDisplayFor', 'iliosAdministratorEmail');
      this.validate().then(() => {
        this.set('isSavingNewSchool', true);
        const title = this.get('title');
        const iliosAdministratorEmail = this.get('iliosAdministratorEmail');
        let newSchool = this.get('store').createRecord('school', {title, iliosAdministratorEmail});
        newSchool.save().then(school => {
          this.set('isSavingNewSchool', false);
          this.get('newSchools').pushObject(school);
          this.set('showNewSchoolForm', false);
          this.set('title', null);
        });
      }).catch(() => {
        return;
      })

    }
  }
});
