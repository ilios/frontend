import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, RSVP, isPresent } = Ember;
const { Promise } = RSVP;

const Validations = buildValidations({
  location: [
    validator('length', {
      allowBlank: true,
      min: 2,
      max: 100
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  didReceiveAttrs(){
    this._super(...arguments);
    const learnerGroup = this.get('learnerGroup');
    if (isPresent(learnerGroup)) {
      this.set('location', learnerGroup.get('location'));
    }
  },
  learnerGroup: null,
  classNames: ['detail-view', 'learnergroup-detail-view'],
  tagName: 'section',
  location: null,
  manageInstructors: false,
  isEditing: false,
  actions: {
    changeLocation() {
      const newLocation = this.get('location');
      const learnerGroup = this.get('learnerGroup');
      this.send('addErrorDisplayFor', 'location');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'location');
            learnerGroup.set('location', newLocation);
            learnerGroup.save().then((newLearnerGroup) => {
              this.set('location', newLearnerGroup.get('location'));
              this.set('learnerGroup', newLearnerGroup);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },
    revertLocationChanges(){
      const learnerGroup = this.get('learnerGroup');
      this.set('location', learnerGroup.get('location'));
    },
    saveInstructors(newInstructors, newInstructorGroups){
      const learnerGroup = this.get('learnerGroup');
      learnerGroup.set('instructors', newInstructors.toArray());
      learnerGroup.set('instructorGroups', newInstructorGroups.toArray());
      this.set('manageInstructors', false);
      return learnerGroup.save();
    }
  }
});
