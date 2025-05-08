import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';

export default class IcsFeedComponent extends Component {
  @service flashMessages;

  get copyButtonId() {
    return `ics-feed-copy-button-${guidFor(this)}`;
  }

  get copyButtonElement() {
    return document.getElementById(this.copyButtonId);
  }

  textCopied = restartableTask(async () => {
    this.flashMessages.success('general.copiedIcsFeedUrl');
  });

  popperOptions = {
    placement: 'right',
    modifiers: [
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['bottom'],
        },
      },
    ],
  };
}
