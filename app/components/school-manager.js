/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Promise } = RSVP;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 60,
      descriptionKey: 'general.title'
    }),
  ]
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  flashMessages: service(),

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('title', this.get('school.title'));
  },
  classNames: ['school-manager' ],
  tagName: 'section',
  school: null,
  title: null,
  canUpdateSchool: false,
  canUpdateCompetency: false,
  canDeleteCompetency: false,
  canCreateCompetency: false,
  canUpdateVocabulary: false,
  canDeleteVocabulary: false,
  canCreateVocabulary: false,
  canUpdateTerm: false,
  canDeleteTerm: false,
  canCreateTerm: false,
  canUpdateSessionType: false,
  canDeleteSessionType: false,
  canCreateSessionType: false,
  canUpdateSchoolConfig: false,

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
    revertTitleChanges(){
      const school = this.school;
      this.set('title', school.get('title'));
    },
  }
});
