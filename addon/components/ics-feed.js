import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';

export default class IcsFeedComponent extends Component {
  @restartableTask
  *textCopied(){
    yield timeout(3000);
  }
}
