/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';

const { alias } = computed;

export default Component.extend({
  programYear: null,
  classNames: ['programyear-header'],
  publishTarget: alias('programYear'),
  canUpdate: false,
  actions: {
    async activate(programYear) {
      programYear.set('published', true);
      programYear.set('publishedAsTbd', false);
      await programYear.save();
    }
  }
});
