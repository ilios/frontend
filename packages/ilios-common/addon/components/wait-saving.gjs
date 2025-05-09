import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import focusTrap from 'ember-focus-trap/modifiers/focus-trap';
import { hash } from '@ember/helper';
import PulseLoader from 'ilios-common/components/pulse-loader';
import t from 'ember-intl/helpers/t';
import ProgressBar from 'ilios-common/components/progress-bar';

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
  <template>
    {{#in-element this.applicationElement insertBefore=null}}
      <div
        class="wait-saving"
        data-test-wait-saving
        ...attributes
        {{focusTrap focusTrapOptions=(hash fallbackFocus=this.contentElement)}}
      >
        <div tabindex="-1" class="content" id={{this.contentId}} data-test-content>
          <PulseLoader />
          <h2 class="page-title">
            {{#if (has-block)}}
              {{yield}}
            {{else}}
              {{t "general.waitSaving"}}
            {{/if}}
          </h2>
          {{#if @showProgress}}
            <ProgressBar @percentage={{this.progress}} />
          {{/if}}
        </div>
      </div>
    {{/in-element}}
  </template>
}
