import Component from '@glimmer/component';
import { restartableTask, timeout } from 'ember-concurrency';
import { guidFor } from '@ember/object/internals';

export default class OfferingUrlDisplayComponent extends Component {
  get copyButtonId() {
    return `offering-url-display-copy-button-${guidFor(this)}`;
  }

  get copyButtonElement() {
    return document.getElementById(this.copyButtonId);
  }

  copy = restartableTask(async () => {
    await timeout(1500);
  });
}
