/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';
import { isPresent, isEmpty } from '@ember/utils';
import RSVP from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task } from 'ember-concurrency';

const { Promise } = RSVP;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 200,
      descriptionKey: 'general.title'
    }),
  ]
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  store: service(),
  classNames: ['new-session'],

  sessionTypes: null,

  title: null,
  selectedSessionTypeId: null,
  isSaving: false,

  'data-test-new-session': true,

  activeSessionTypes: computed('sessionTypes.[]', async function() {
    const sessionTypes = await this.sessionTypes;
    return sessionTypes.filterBy('active', true);
  }),

  selectedSessionType: computed('activeSessionTypes.[]', 'selectedSessionTypeId', function(){
    return new Promise(resolve => {
      let selectedSessionType;
      this.sessionTypes.then(sessionTypes => {
        const selectedSessionTypeId = this.selectedSessionTypeId;
        if(isPresent(selectedSessionTypeId)){
          selectedSessionType = sessionTypes.find(sessionType => {
            return parseInt(sessionType.get('id'), 10) === parseInt(selectedSessionTypeId, 10);
          });
        }

        if (isEmpty(selectedSessionType)){
          //try and default to a type names 'Lecture';
          selectedSessionType = sessionTypes.find(sessionType => sessionType.get('title') === 'Lecture');
        }

        if(isEmpty(selectedSessionType)){
          selectedSessionType = sessionTypes.get('firstObject');
        }

        resolve(selectedSessionType);

      });
    });
  }),

  saveNewSession: task(function * () {
    const save = this.save;
    this.send('addErrorDisplayFor', 'title');
    const { validations } = yield this.validate();
    if (validations.get('isValid')) {
      const sessionType = yield this.selectedSessionType;
      let session = this.store.createRecord('session', {
        title: this.title,
        sessionType
      });
      yield save(session);
      this.sendAction('cancel');
    }
  }),

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.saveNewSession.perform();
      return;
    }

    if(27 === keyCode) {
      this.sendAction('cancel');
    }
  },
});
