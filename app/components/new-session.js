import Ember from 'ember';
import EmberValidations from 'ember-validations';

const { computed, Component, inject, isEmpty, isPresent } = Ember;
const { sort } = computed;
const { service } = inject;

export default Component.extend(EmberValidations, {
  init() {
    this._super(...arguments);

    this.set('showErrorsFor', []);
  },

  classNames: ['new-session', 'resultslist-new', 'form-container'],

  i18n: service(),

  sessionTypes: [],
  sortSessionsBy: ['title'],
  sortedSessionTypes: sort('sessionTypes', 'sortSessionsBy'),

  showErrorsFor: [],
  validations: {
    'title': {
      presence: true,
      length: { minimum: 3, maximum: 200 }
    }
  },

  title: null,
  selectedSessionTypeId: null,


  selectedSessionType: computed('sessionTypes.[]', 'selectedSessionTypeId', function(){
    let sessionTypes = this.get('sessionTypes');
    const selectedSessionTypeId = this.get('selectedSessionTypeId');
    if(isPresent(selectedSessionTypeId)){
      return sessionTypes.find(sessionType => {
        return parseInt(sessionType.get('id')) === parseInt(selectedSessionTypeId);
      });
    }

    //try and default to a type names 'Lecture';
    let lectureType = sessionTypes.find(sessionType => sessionType.get('title') === 'Lecture');
    if(isEmpty(lectureType)){
      lectureType = sessionTypes.get('firstObject');
    }

    return lectureType;
  }),

  actions: {
    save() {
      this.validate()
        .then(() => {
          const title = this.get('title');
          const sessionType = this.get('selectedSessionType');

          this.sendAction('save', title, sessionType);
        })
        .catch(() => {
          return;
        });
    },

    cancel() {
      this.sendAction('cancel');
    },

    addErrorDisplayFor(field){
      this.get('showErrorsFor').pushObject(field);
    },
  }
});
