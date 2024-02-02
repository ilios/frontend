import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';

export default class ProgressBarComponent extends Component {
  get widthStyle() {
    const str = `width: ${this.args.percentage}%`;

    return htmlSafe(str);
  }
}
