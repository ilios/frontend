import Component from '@ember/component';

export default Component.extend({
  classNames: ['programyear-header'],

  canUpdate: false,
  programYear: null,

  actions: {
    async activate(programYear) {
      programYear.set('published', true);
      programYear.set('publishedAsTbd', false);
      await programYear.save();
    }
  }
});
