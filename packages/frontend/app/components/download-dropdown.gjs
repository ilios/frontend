import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { fn, uniqueId } from '@ember/helper';
import { eq } from 'ember-truth-helpers';
import toggle from 'ilios-common/helpers/toggle';
import t from 'ember-intl/helpers/t';
import focus from 'ilios-common/modifiers/focus';
import onClickOutside from 'ember-click-outside/modifiers/on-click-outside';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCaretDown, faCaretRight, faDownload } from '@fortawesome/free-solid-svg-icons';

export default class DownloadDropdownComponent extends Component {
  @tracked isOpen = false;

  @action
  close() {
    this.isOpen = false;
  }

  @action
  moveFocus(event) {
    const { key, target } = event;
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        if (target.nextElementSibling) {
          target.nextElementSibling.focus();
        } else {
          target.parentElement.firstElementChild.focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (target.previousElementSibling) {
          target.previousElementSibling.focus();
        } else {
          target.parentElement.lastElementChild.focus();
        }
        break;
      case 'Escape':
      case 'Tab':
      case 'ArrowRight':
      case 'ArrowLeft':
        this.isOpen = false;
        break;
    }
  }

  @action
  toggleMenu(event) {
    const { key } = event;
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this.isOpen = true;
        break;
      case 'Escape':
      case 'Tab':
      case 'ArrowRight':
      case 'ArrowLeft':
        this.isOpen = false;
        break;
    }
  }

  <template>
    {{#let (uniqueId) as |templateId|}}
      <div class="download-dropdown" {{onClickOutside this.close}} data-test-download-dropdown>
        <button
          type="button"
          class="toggle"
          aria-haspopup="true"
          aria-expanded={{this.isOpen}}
          aria-labelledby="{{templateId}}-download-dropdown-title"
          data-level="toggle"
          data-test-toggle
          {{on "click" (toggle "isOpen" this)}}
          {{on "keydown" this.toggleMenu}}
        >
          <FaIcon @icon={{faDownload}} />
          {{t "general.downloadResults"}}
          <FaIcon @icon={{if this.isOpen faCaretDown faCaretRight}} @fixedWidth={{true}} />
        </button>

        {{#if this.isOpen}}
          <div class="menu" role="menu" data-test-menu>
            {{#each @links as |link index|}}
              <button
                type="button"
                class="dropdown-item"
                role="menuitem"
                title={{link.tooltip}}
                tabindex="-1"
                data-level="item"
                data-test-item
                {{on "click" (fn @action link.filename)}}
                {{on "keydown" this.moveFocus}}
                {{focus (eq index 0)}}
              >
                {{link.title}}
              </button>
            {{/each}}
          </div>
        {{/if}}
      </div>
    {{/let}}
  </template>
}
