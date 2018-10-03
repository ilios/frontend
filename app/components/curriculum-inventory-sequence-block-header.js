/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const { alias } = computed;
const { Promise } = RSVP;

const Validations = buildValidations({
  blockTitle: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 200
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('blockTitle', this.get('sequenceBlock.title'));
  },
  store: service(),
  classNames: ['curriculum-inventory-sequence-block-header'],
  report: null,
  canUpdate: false,
  reportName: null,
  publishTarget: alias('sequenceBlock'),
  actions: {
    changeTitle(){
      const block = this.get('sequenceBlock');
      const newTitle = this.get('blockTitle');
      this.send('addErrorDisplayFor', 'blockTitle');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'blockTitle');
            block.set('title', newTitle);
            block.save().then((newBlock) => {
              this.set('blockTitle', newBlock.get('title'));
              this.set('sequenceBlock', newBlock);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },

    revertTitleChanges(){
      const block = this.get('sequenceBlock');
      this.set('blockTitle', block.get('title'));
    },
  }
});
