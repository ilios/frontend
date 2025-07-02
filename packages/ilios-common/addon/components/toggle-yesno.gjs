import Component from '@glimmer/component';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';

export default class ToggleYesno extends Component {
  get yes() {
    return !!this.args.yes;
  }

  @action
  click() {
    this.args.toggle(!this.yes);
  }
  <template>
    <button
      aria-checked="{{if this.yes 'true' 'false'}}"
      aria-label="{{if this.yes (t 'general.yes') (t 'general.no')}}"
      class="toggle-yesno {{if this.yes 'yes' 'no'}}"
      data-test-toggle-yesno
      role="switch"
      type="button"
      disabled={{@disabled}}
      {{on "click" this.click}}
    >
      <span class="switch-handle" data-test-handle>
        {{#if this.yes}}
          <FaIcon role="presentation" @icon="plus" />
        {{else}}
          <FaIcon role="presentation" @icon="minus" />
        {{/if}}
      </span>
    </button>
  </template>
}
