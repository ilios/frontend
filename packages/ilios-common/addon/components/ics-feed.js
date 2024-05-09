import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';
import { service } from '@ember/service';

export default class IcsFeedComponent extends Component {
  @service flashMessages;

  textCopied = restartableTask(async () => {
    this.flashMessages.success('general.copiedIcsFeedUrl');
  });
}
