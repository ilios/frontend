import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, computed} = Ember;
const { sort } = computed;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 60,
      descriptionKey: 'general.title'
    }),
  ],
  iliosAdministratorEmail: [
    validator('presence', true),
    validator('length', {
      max: 100
    }),
    validator('format', {
      type: 'email'
    }),
  ],
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  currentUser: Ember.inject.service(),
  store: Ember.inject.service(),
  classNames: ['school-list'],
  tagName: 'section',
  schools: [],
  newSchools: [],
  title: null,
  iliosAdministratorEmail: null,
  isSavingNewSchool: false,

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
    createNewSchool() {
      this.set('isSavingNewSchool', true);
      this.send('addErrorDisplayFor', 'title');
      this.send('addErrorDisplayFor', 'iliosAdministratorEmail');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          const title = this.get('title');
          const iliosAdministratorEmail = this.get('iliosAdministratorEmail');
          let newSchool = this.get('store').createRecord('school', {title, iliosAdministratorEmail});
          newSchool.save().then(school => {
            this.get('newSchools').pushObject(school);
          }).finally(() => {
            this.send('clearErrorDisplay');
            this.set('title', null);
            this.set('showNewSchoolForm', false);
            this.set('isSavingNewSchool', false);

          });
        }
      });
    },
  }
});
