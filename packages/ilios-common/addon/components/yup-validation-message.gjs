import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class YupValidationMessage extends Component {
  @service intl;

  get messages() {
    const messages = this.args.validationErrors?.map(({ messageKey, values }) => {
      if (!values) {
        values = {};
      }
      if (this.args.description) {
        values.description = this.args.description;
      } else {
        values.description = this.intl.t('errors.description');
      }

      return this.intl.t(messageKey, values);
    });
    if (messages) {
      if (this.args.showAll) {
        return messages;
      } else {
        // only return the first message, as an array.
        return messages.slice(0, 1);
      }
    }
    return [];
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
