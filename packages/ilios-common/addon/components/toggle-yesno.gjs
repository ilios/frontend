import Component from '@glimmer/component';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

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
      {{on "click" this.click}}
    >
      <span class="switch-handle" data-test-handle>
        {{#if this.yes}}
          <FaIcon role="presentation" @icon={{faPlus}} />
        {{else}}
          <FaIcon role="presentation" @icon={{faMinus}} />
        {{/if}}
      </span>
    </button>
  </template>
}
