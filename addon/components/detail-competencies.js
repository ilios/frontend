/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import layout from '../templates/components/detail-competencies';
import { computed } from '@ember/object';
import { Promise as RSVPPromise } from 'rsvp';

export default Component.extend({
  layout,
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
    return new RSVPPromise(resolve => {
      this.get('course.competencies').then(competencies => {
        resolve(competencies.length);
      });
    });
  }),

  actions: {
    collapse(){
      this.get('course.competencies').then(competencies => {
        const collapse = this.get('collapse');
        if (competencies.length) {
          collapse();
        }
      });
    },
  }
});
