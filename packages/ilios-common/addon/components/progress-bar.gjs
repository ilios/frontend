import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import or from 'ember-truth-helpers/helpers/or';

export default class ProgressBarComponent extends Component {
  get widthStyle() {
    const str = `width: ${this.args.percentage}%`;

    return htmlSafe(str);
  }
  <template>
    <div class="progress-bar">
      {{! template-lint-disable no-inline-styles }}
      <span class="meter" style={{this.widthStyle}}>
        <p>
          {{or @percentage "0"}}%
        </p>
      </span>
    </div>
  </template>
}
