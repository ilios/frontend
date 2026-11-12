import { hash,uniqueId } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCaretDown,faCaretRight, faUser } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import onClickOutside from 'ember-click-outside/modifiers/on-click-outside';
import { task, timeout } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import set from 'ember-set-helper/helpers/set';

import focus from '../modifiers/focus';
import LinkToWithAction from './link-to-with-action';

export default class UserMenuComponent extends Component {
  @service intl;
  @service currentUser;
  @tracked isOpen = false;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get model() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  get menuTitle() {
    return this.model?.fullName || this.intl.t('general.userMenu');
  }

  focusFirstLink = task(async () => {
    await timeout(1);
    document.querySelector('.user-menu .menu a:first-of-type')?.focus();
  });

  @action
  async toggleMenu() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      await this.focusFirstLink.perform();
    }
  }

  @action
  keyDown(evt) {
    const button = evt.target.tagName.toLowerCase() === 'button' ? evt.target : null;
    let item;
    if (!button) {
      item = evt.target.tagName.toLowerCase() === 'li' ? evt.target : evt.target.parentElement;
    }

    switch (evt.key) {
      case 'ArrowDown':
        evt.preventDefault();
        this.handleArrowDown(evt, item);
        break;
      case 'ArrowUp':
        evt.preventDefault();
        this.handleArrowUp(item);
        break;
      case 'Escape':
      case 'Tab':
      case 'ArrowRight':
      case 'ArrowLeft':
        this.isOpen = false;
        break;
    }

    return true;
  }

  async handleArrowDown(event, item) {
    if (event.target.tagName.toLowerCase() === 'button') {
      this.isOpen = true;
      await this.focusFirstLink.perform();
    } else {
      if (item.nextElementSibling) {
        item.nextElementSibling.querySelector('a').focus();
      } else {
        item.parentElement.firstElementChild.querySelector('a').focus();
      }
    }
  }

  handleArrowUp(item) {
    if (item?.previousElementSibling) {
      item.previousElementSibling.querySelector('a').focus();
    } else {
      item?.parentElement.lastElementChild.querySelector('a').focus();
    }
  }
  <template>
    {{#let (uniqueId) as |templateId|}}
      <nav
        class="user-menu header-menu{{if this.isOpen ' is-open'}}"
        aria-label={{t "general.userMenu"}}
        {{! template-lint-disable no-invalid-interactive }}
        {{on "keydown" this.keyDown}}
        data-test-user-menu
      >
        <button
          type="button"
          class="toggle"
          aria-labelledby="{{templateId}}-user-menu-title"
          aria-haspopup="true"
          aria-expanded={{if this.isOpen "true" "false"}}
          data-test-toggle
          {{on "click" this.toggleMenu}}
        >
          <FaIcon @icon={{faUser}} />
          <span id="{{templateId}}-user-menu-title">
            {{this.menuTitle}}
          </span>
          <FaIcon @icon={{if this.isOpen faCaretDown faCaretRight}} @fixedWidth={{true}} />
        </button>
        {{#if this.isOpen}}
          <div {{onClickOutside (set this "isOpen" false)}}>
            <ul class="menu">
              <li tabindex="-1" data-test-item {{focus}}>
                <LinkToWithAction
                  @route="myprofile"
                  @action={{set this "isOpen" false}}
                  @queryParams={{hash invalidatetokens=null newtoken=null}}
                  class="header-menu-item"
                  data-test-item-link
                >
                  {{t "general.myProfile"}}
                </LinkToWithAction>
              </li>
              <li tabindex="-1" data-test-item>
                <LinkToWithAction
                  @route="logout"
                  @action={{set this "isOpen" false}}
                  class="header-menu-item"
                  data-test-item-link
                >
                  {{t "general.logout"}}
                </LinkToWithAction>
              </li>
            </ul>
          </div>
        {{/if}}
      </nav>
    {{/let}}
  </template>
}
