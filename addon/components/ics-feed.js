import Component from '@glimmer/component';
import { restartableTask, timeout } from 'ember-concurrency';

export default class IcsFeedComponent extends Component {
  @restartableTask
  *textCopied() {
    yield timeout(3000);
  }
}
