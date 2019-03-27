/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  programYear: null,
  classNames: ['programyear-header'],
  canUpdate: false,
  actions: {
    async activate(programYear) {
      programYear.set('published', true);
      programYear.set('publishedAsTbd', false);
      await programYear.save();
    }
  }
});
