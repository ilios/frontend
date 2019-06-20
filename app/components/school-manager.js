import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 60,
      descriptionKey: 'general.title'
    })
  ]
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  flashMessages: service(),

  classNames: ['school-manager' ],
  tagName: 'section',

  canCreateCompetency: false,
  canCreateSessionType: false,
  canCreateTerm: false,
  canCreateVocabulary: false,
  canDeleteCompetency: false,
  canDeleteSessionType: false,
  canDeleteTerm: false,
  canDeleteVocabulary: false,
  canUpdateCompetency: false,
  canUpdateSchool: false,
  canUpdateSchoolConfig: false,
  canUpdateSessionType: false,
  canUpdateVocabulary: false,
  canUpdateTerm: false,
  school: null,
  title: null,

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('title', this.get('school.title'));
  },

  actions: {
    changeTitle() {
      const school = this.school;
      const newTitle = this.title;
      this.send('addErrorDisplayFor', 'title');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('clearErrorDisplay');
            school.set('title', newTitle);
            school.save().then((newSchool) => {
              this.set('title', newSchool.get('title'));
              this.set('school', newSchool);
              this.flashMessages.success('general.savedSuccessfully');
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },

    revertTitleChanges() {
      const school = this.school;
      this.set('title', school.get('title'));
    }
  }
});
