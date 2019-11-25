import Component from '@ember/component';
import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 60,
      descriptionKey: 'general.title'
    })
  ],
  iliosAdministratorEmail: [
    validator('presence', true),
    validator('length', {
      max: 100
    }),
    validator('format', {
      type: 'email'
    })
  ]
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  currentUser: service(),
  store: service(),

  classNames: ['school-list'],
  tagName: 'section',

  iliosAdministratorEmail: null,
  isSavingNewSchool: false,
  newSchool: null,
  schools: null,
  showNewSchoolForm: false,
  sortSchoolsBy: null,
  title: null,

  sortedSchools: sort('schools', 'sortSchoolsBy'),

  init(){
    this._super(...arguments);
    this.set('sortSchoolsBy', ['title']);
  },

  actions: {
    toggleNewSchoolForm() {
      this.set('showNewSchoolForm', !this.showNewSchoolForm);
      this.set('newSchool', null);
      this.set('title', null);
      this.set('iliosAdministratorEmail', null);
    },

    hideNewSchoolForm() {
      this.set('showNewSchoolForm', false);
      this.set('title', null);
      this.set('iliosAdministratorEmail', null);
    },

    createNewSchool() {
      this.set('isSavingNewSchool', true);
      this.send('addErrorDisplayFor', 'title');
      this.send('addErrorDisplayFor', 'iliosAdministratorEmail');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          const title = this.title;
          const iliosAdministratorEmail = this.iliosAdministratorEmail;
          const newSchool = this.store.createRecord('school', {title, iliosAdministratorEmail});
          newSchool.save().then(school => {
            this.set('newSchool', school);
          }).finally(() => {
            this.send('clearErrorDisplay');
            this.set('title', null);
            this.set('iliosAdministratorEmail', null);
            this.set('showNewSchoolForm', false);
            this.set('isSavingNewSchool', false);
          });
        } else {
          this.set('isSavingNewSchool', false);
        }
      });
    }
  },

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.send('createNewSchool');
      return;
    }

    if (27 === keyCode) {
      this.send('hideNewSchoolForm');
    }
  }
});
