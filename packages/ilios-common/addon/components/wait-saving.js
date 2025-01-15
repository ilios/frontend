import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class WaitSaving extends Component {
  get contentId() {
    return `wait-saving-${guidFor(this)}`;
  }

  get contentElement() {
    return document.getElementById(this.contentId);
  }

  get progress() {
    const total = this.args.totalProgress || 1;
    const current = this.args.currentProgress || 0;
    return Math.floor((current / total) * 100);
  }
  get applicationElement() {
    return document.querySelector('.ember-application');
  }
}
