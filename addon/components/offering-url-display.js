import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';

export default class OfferingUrlDisplayComponent extends Component {
  @restartableTask
  *copy() {
    yield timeout(1500);
  }
}
