import Component from '@ember/component';
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
    async changeTitle() {
      const { school, title } = this.getProperties('school', 'title');
      this.send('addErrorDisplayFor', 'title');

      if (this.validations.isValid) {
        this.send('clearErrorDisplay');
        school.set('title', title);
        const newSchool = await school.save();
        this.setProperties({ school: newSchool, title: newSchool.title });
        this.flashMessages.success('general.savedSuccessfully');
      }
    },

    revertTitleChanges() {
      const school = this.school;
      this.set('title', school.get('title'));
    }
  }
});
