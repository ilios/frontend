import Component from '@glimmer/component';
import { service } from '@ember/service';
import validationMessages from 'ilios-common/utils/validation-messages';

export default class YupValidationMessage extends Component {
  @service intl;
  get messages() {
    return validationMessages(this.intl, this.args.validationErrors, {
      description: this.args.description,
      showAll: this.args.showAll,
    });
  }
  <template>
    {{#if this.messages.length}}
      <span ...attributes>
        {{#each this.messages as |m|}}
          <span class="validation-error-message" data-test-validation-error-message>
            {{m}}
          </span>
        {{/each}}
      </span>
    {{/if}}
  </template>
}
