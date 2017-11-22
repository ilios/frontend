import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { sort } from '@ember/object/computed';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

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
  currentUser: service(),
  store: service(),
  init(){
    this._super(...arguments);
    this.set('newSchools', []);
    this.set('sortSchoolsBy', ['title']);
  },
  classNames: ['school-list'],
  tagName: 'section',
  schools: null,
  newSchools: null,
  title: null,
  iliosAdministratorEmail: null,
  isSavingNewSchool: false,

  sortSchoolsBy: null,
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
