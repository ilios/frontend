/* eslint ember/order-in-components: 0 */
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
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  learnerGroup: null,
  canUpdate: false,
  tagName: 'header',
  classNames: ['learnergroup-header'],
  didReceiveAttrs(){
    this._super(...arguments);
    const learnerGroup = this.get('learnerGroup');
    if (learnerGroup) {
      this.set('title', learnerGroup.get('title'));
    }
  },
  title: null,

  changeTitle: task(function * () {
    const learnerGroup = this.get('learnerGroup');
    const newTitle = this.get('title');
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
  }),

  actions: {
    revertTitleChanges(){
      const learnerGroup = this.get('learnerGroup');
      this.set('title', learnerGroup.get('title'));
    },
  }
});
