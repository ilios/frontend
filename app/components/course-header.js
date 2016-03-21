import Ember from 'ember';
import Publishable from 'ilios/mixins/publishable';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, computed, RSVP } = Ember;
const { alias, not } = computed;
const { Promise } = RSVP;

const Validations = buildValidations({
  courseTitle: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 200
    }),
  ],
});

export default Component.extend(Validations, Publishable, ValidationErrorDisplay, {
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('courseTitle', this.get('course.title'));
  },
  course: null,
  courseTitle: null,
  publishTarget: alias('course'),

  editable: not('course.locked'),

  actions: {
    changeTitle() {
      const course = this.get('course');
      const newTitle = this.get('courseTitle');
      this.send('addErrorDisplayFor', 'courseTitle');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'courseTitle');
            course.set('title', newTitle);
            course.save().then((newCourse) => {
              this.set('courseTitle', newCourse.get('title'));
              this.set('course', newCourse);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },
    revertTitleChanges(){
      const course = this.get('course');
      this.set('courseTitle', course.get('title'));
    },
  }
});
