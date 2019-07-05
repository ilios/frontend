import Component from '@ember/component';
import layout from '../templates/components/course-header';
import { computed } from '@ember/object';
import { reject } from 'rsvp';
import Publishable from 'ilios-common/mixins/publishable';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const { alias } = computed;

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
  layout,
  classNames: ['course-header'],
  course: null,
  courseTitle: null,
  editable: false,
  'data-test-course-header': true,

  publishTarget: alias('course'),

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('courseTitle', this.get('course.title'));
  },

  actions: {
    async changeTitle() {
      const course = this.course;
      const newTitle = this.courseTitle;
      this.send('addErrorDisplayFor', 'courseTitle');
      const { validations } = await this.validate();

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'courseTitle');
        course.set('title', newTitle);
        const newCourse = await course.save();
        this.set('courseTitle', newCourse.title);
        this.set('course', newCourse);
      } else {
        await reject();
      }
    },

    revertTitleChanges(){
      const course = this.get('course');
      this.set('courseTitle', course.get('title'));
    },
  }
});
