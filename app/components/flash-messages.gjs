import Component from '@glimmer/component';
import { service } from '@ember/service';
import { capitalize } from '@ember/string';
import FlashMessage from 'ember-cli-flash/components/flash-message';

export default class FlashMessagesComponent extends Component {
  @service flashMessages;
  <template>
    <div class="flash-messages" data-test-flash-messages ...attributes>
      {{#each this.flashMessages.arrangedQueue as |f|}}
        <FlashMessage @flash={{f}} as |component flash|>
          {{#if flash.capitalize}}
            {{capitalize flash.message}}
          {{else}}
            {{flash.message}}
          {{/if}}
        </FlashMessage>
      {{/each}}
    </div>
  </template>
}
