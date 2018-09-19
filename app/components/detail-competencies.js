/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
const { Promise } = RSVP;

export default Component.extend({
  course: null,
  editable: true,
  tagName: 'section',
  classNameBindings: [':detail-competencies', 'showCollapsible:collapsible'],

  /**
   *
   * @property showCollapsible
   * @type {Ember.computed}
   * @public
   */
  showCollapsible: computed('course.competencies.[]', function () {
    return new Promise(resolve => {
      this.get('course.competencies').then(competencies => {
        resolve(competencies.length);
      });
    });
  }),

  actions: {
    collapse(){
      this.get('course.competencies').then(competencies => {
        const collapse = this.collapse;
        if (competencies.length) {
          collapse();
        }
      });
    },
  }
});
