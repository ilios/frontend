import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { guidFor } from '@ember/object/internals';
import toggle from 'ilios-common/helpers/toggle';
import t from 'ember-intl/helpers/t';
import onClickOutside from 'ember-click-outside/modifiers/on-click-outside';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCaretDown, faCaretRight, faDownload } from '@fortawesome/free-solid-svg-icons';
import DownloadDropdownItem from 'frontend/components/download-dropdown-item';

export default class DownloadDropdownComponent extends Component {
  @tracked isOpen = false;

  get downloadDropdownId() {
    return `download-dropdown-${guidFor(this)}`;
  }

  @action
  close() {
    this.isOpen = false;
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

  @action
  toggleTooltip(index) {
    this.showTooltips[index] = !this.showTooltips[index];
  }

  <template>
    <div class="download-dropdown" {{onClickOutside this.close}} data-test-download-dropdown>
      <button
        type="button"
        class="toggle"
        id={{this.downloadDropdownId}}
        aria-haspopup="true"
        aria-expanded={{this.isOpen}}
        aria-labelledby="{{this.downloadDropdownId}}-download-dropdown-title"
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
          {{#each @items as |item index|}}
            <DownloadDropdownItem
              @item={{item}}
              @index={{index}}
              @action={{@action}}
              @closeMenu={{this.close}}
            />
          {{/each}}
        </div>
      {{/if}}
    </div>
  </template>
}
