import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default class ChooseMaterialTypeComponent extends Component {
  @tracked isOpen = false;

  focusFirstLink = task(async (item) => {
    await timeout(1);
    item.querySelector('.menu button:first-of-type').focus();
  });

  handleArrowUp(item) {
    if (item?.previousElementSibling) {
      item.previousElementSibling.focus();
    } else {
      item?.parentElement.lastElementChild.focus();
    }
  }

  async handleArrowDown(item) {
    if (item.classList.value.includes('toggle')) {
      this.isOpen = true;
      await this.focusFirstLink.perform(item.parentElement);
    } else {
      if (item.nextElementSibling) {
        item.nextElementSibling.focus(item.parentElement);
      } else {
        await this.focusFirstLink.perform(item.parentElement);
      }
    }
  }

  @action
  async toggleMenu({ target }) {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      await this.focusFirstLink.perform(target.parentElement.parentElement);
    }
  }
  @action
  keyUp({ key, target }) {
    switch (key) {
      case 'ArrowDown':
        this.handleArrowDown(target);
        break;
      case 'ArrowUp':
        this.handleArrowUp(target);
        break;
      case 'Escape':
      case 'Tab':
      case 'ArrowRight':
      case 'ArrowLeft':
        this.close();
        break;
    }
  }
  @action
  clearFocus({ target }) {
    const menu = target.parentElement.parentElement;
    menu.querySelectorAll('button').forEach((el) => el.blur());
  }
  @action
  close() {
    this.isOpen = false;
  }
}

<div
  role="menubar"
  class="choose-material-type"
  data-test-choose-material-type
  {{on-click-outside this.close}}
>
  <button
    aria-label={{t "general.add"}}
    role="menuitem"
    class="toggle new-material-type"
    type="button"
    aria-haspopup="true"
    aria-expanded={{if this.isOpen "true" "false"}}
    data-test-toggle
    {{on "keyup" this.keyUp}}
    {{on "click" this.toggleMenu}}
  >
    {{t "general.add"}}
    <FaIcon @icon={{if this.isOpen "caret-down" "caret-right"}} />
  </button>
  {{#if this.isOpen}}
    <div class="menu" role="menu">
      {{#each @types as |type|}}
        <button
          role="menuitem"
          type="button"
          tabindex="-1"
          data-test-item
          {{on "click" (fn @choose type)}}
          {{on "keyup" this.keyUp}}
          {{on "mouseenter" this.clearFocus}}
        >
          {{t (concat "general." type)}}
        </button>
      {{/each}}
    </div>
  {{/if}}
</div>