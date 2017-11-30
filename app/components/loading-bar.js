import Component from '@ember/component';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  classNameBindings: [':loading-bar'],
  progress: 0,

  isLoading: false,

  didReceiveAttrs() {
    const incrementProgress = this.get('incrementProgress');
    incrementProgress.perform();
  },

  barWidth: computed('progress', function () {
    const progress = parseInt(this.get('progress'), 10);

    return htmlSafe(`width: ${progress}%;`);
  }),

  incrementProgress: task(function * () {
    const removeProgress = this.get('removeProgress');
    const isLoading = this.get('isLoading');
    const progress = this.get('progress');
    const incrementProgress = this.get('incrementProgress');
    if (isLoading) {
      // as progress goes up we load progressively faster to give the appearance of acceleration
      const velocity = 200 - progress * progress;
      yield timeout(velocity > 50? velocity : 50);
      //don't ever let the progress get to 100%
      const newProgress = progress === 99 ? 99 : progress + 1;
      this.set('progress', newProgress);
      incrementProgress.perform();
    } else {
      return removeProgress.perform();
    }
  }).restartable(),

  removeProgress: task(function * () {
    const progress = this.get('progress');
    if (progress > 0) {
      yield timeout(1);
      this.set('progress', 100);
      yield timeout(500);
      this.set('progress', 0);
    }
  }).drop(),
});
