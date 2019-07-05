import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';
import { isPresent, isEmpty } from '@ember/utils';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';
import { task } from 'ember-concurrency';
import layout from '../templates/components/new-session';

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
  layout,
  classNames: ['new-session'],

  sessionTypes: null,

  title: null,
  selectedSessionTypeId: null,
  isSaving: false,

  'data-test-new-session': true,

  activeSessionTypes: computed('sessionTypes.[]', async function() {
    const sessionTypes = await this.get('sessionTypes');
    return sessionTypes.filterBy('active', true);
  }),

  selectedSessionType: computed('activeSessionTypes.[]', 'selectedSessionTypeId', async function() {
    let selectedSessionType;
    const sessionTypes = await this.sessionTypes;
    const selectedSessionTypeId = this.selectedSessionTypeId;

    if (isPresent(selectedSessionTypeId)) {
      selectedSessionType = sessionTypes.find((sessionType) => {
        return parseInt(sessionType.id, 10) === parseInt(selectedSessionTypeId, 10);
      });
    }

    if (isEmpty(selectedSessionType)) {
      // try and default to a type names 'Lecture';
      selectedSessionType = sessionTypes.find(sessionType => sessionType.title === 'Lecture');
    }

    if (isEmpty(selectedSessionType)) {
      selectedSessionType = sessionTypes.firstObject;
    }

    return selectedSessionType;
  }),

  saveNewSession: task(function * () {
    const save = this.get('save');
    this.send('addErrorDisplayFor', 'title');
    const { validations } = yield this.validate();
    if (validations.get('isValid')) {
      const sessionType = yield this.get('selectedSessionType');
      let session = this.get('store').createRecord('session', {
        title: this.get('title'),
        sessionType
      });
      yield save(session);
      this.cancel();
    }
  }),

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.get('saveNewSession').perform();
      return;
    }

    if(27 === keyCode) {
      this.cancel();
    }
  },
});
