import { on } from '@ember/modifier';
import { action } from '@ember/object';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class ToggleYesnoComponent extends Component {
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
