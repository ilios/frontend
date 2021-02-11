import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { htmlSafe } from '@ember/template';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';

export default class LoadingBarComponent extends Component {
  @tracked progress = 0;

  get barWidth() {
    return htmlSafe(`width: ${this.progress}%;`);
  }

  @restartableTask
  *incrementProgress() {
    if (this.args.isLoading) {
      // as progress goes up we load progressively faster to give the appearance of acceleration
      const velocity = 200 - this.progress * this.progress;
      yield timeout(velocity > 50 ? velocity : 50);
      //don't ever let the progress get to 100%
      this.progress = this.progress === 99 ? 99 : this.progress + 1;
      this.incrementProgress.perform();
    } else {
      return this.removeProgress.perform();
    }
  }

  @dropTask
  *removeProgress() {
    if (this.progress > 0) {
      yield timeout(1);
      this.progress = 100;
      yield timeout(500);
      this.progress = 0;
    }
  }
}
