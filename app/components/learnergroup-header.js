import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 60
    })
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  classNames: ['learnergroup-header'],
  tagName: 'header',

  'data-test-learnergroup-header': true,

  canUpdate: false,
  learnerGroup: null,
  title: null,

  didReceiveAttrs() {
    this._super(...arguments);
    const learnerGroup = this.learnerGroup;
    if (learnerGroup) {
      this.set('title', learnerGroup.get('title'));
    }
  },

  actions: {
    revertTitleChanges() {
      const learnerGroup = this.learnerGroup;
      this.set('title', learnerGroup.get('title'));
    }
  },

  changeTitle: task(function* () {
    const learnerGroup = this.learnerGroup;
    const newTitle = this.title;
    this.send('addErrorDisplayFor', 'title');
    const {validations} = yield this.validate();
    if (validations.get('isValid')) {
      this.send('removeErrorDisplayFor', 'title');
      learnerGroup.set('title', newTitle);
      yield learnerGroup.save();
      this.set('title', learnerGroup.get('title'));
    } else {
      throw false;
    }
  })
});
