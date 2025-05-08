import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';

export default class CopyButtonComponent extends Component {
  copy = restartableTask(async () => {
    await navigator.clipboard.writeText(this.args.clipboardText);
    if (this.args.success) {
      this.args.success();
    }
  });
}

<button
  type="button"
  class="copy-btn"
  data-test-copy-button
  ...attributes
  {{on "click" (perform this.copy)}}
>
  {{yield}}
</button>