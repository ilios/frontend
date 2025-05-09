import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { uniqueId, get } from '@ember/helper';
import onClickOutside from 'ember-click-outside/modifiers/on-click-outside';
import set from 'ember-set-helper/helpers/set';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import focus from 'ilios-common/modifiers/focus';
import t from 'ember-intl/helpers/t';

export default class SessionPublicationMenuComponent extends Component {
  @service router;
  @service intl;
  @service flashMessages;
  @tracked isOpen = false;

  get hideCheckLink() {
    return this.args.hideCheckLink || false;
  }

  get title() {
    if (this.args.session.publishedAsTbd) {
      return this.intl.t('general.scheduled');
    }
    if (this.args.session.published) {
      return this.intl.t('general.published');
    }
    return this.intl.t('general.notPublished');
  }
  get icon() {
    if (this.args.session.publishedAsTbd) {
      return 'clock';
    }
    if (this.args.session.published) {
      return 'star';
    }
    return 'cloud';
  }

  get showTbd() {
    return !this.args.session.publishedAsTbd;
  }
  get showAsIs() {
    return (
      (!this.args.session.published || this.args.session.publishedAsTbd) &&
      this.args.session.requiredPublicationIssues.length === 0 &&
      this.args.session.allPublicationIssuesLength !== 0
    );
  }
  get showReview() {
    if (this.router.currentRouteName === 'session.publication-check') {
      return false;
    }
    return !this.hideCheckLink && this.args.session.allPublicationIssuesLength > 0;
  }
  get showPublish() {
    return (
      (!this.args.session.published || this.args.session.publishedAsTbd) &&
      this.args.session.allPublicationIssuesLength === 0
    );
  }
  get showUnPublish() {
    return this.args.session.published || this.args.session.publishedAsTbd;
  }
  get publicationStatus() {
    if (this.args.session.publishedAsTbd) {
      return 'scheduled';
    } else if (this.args.session.published) {
      return 'published';
    }

    return 'notpublished';
  }

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
    if (item.classList.value == 'toggle') {
      this.isOpen = true;
      await this.focusFirstLink.perform(item.parentElement);
    } else {
      if (item.nextElementSibling) {
        item.nextElementSibling.focus();
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

    return true;
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

  @action
  scrollToSessionPublication() {
    this.isOpen = false;
    this.router.transitionTo('session.publication-check', this.args.session);
  }
  @action
  async publish() {
    this.isOpen = false;
    this.args.session.set('publishedAsTbd', false);
    this.args.session.set('published', true);
    await this.args.session.save();
    this.flashMessages.success('general.publishedSuccessfully');
  }
  @action
  async unpublish() {
    this.isOpen = false;
    this.args.session.set('publishedAsTbd', false);
    this.args.session.set('published', false);
    await this.args.session.save();
    this.flashMessages.success('general.unPublishedSuccessfully');
  }
  @action
  async publishAsTbd() {
    this.isOpen = false;
    this.args.session.set('publishedAsTbd', true);
    this.args.session.set('published', true);
    await this.args.session.save();
    this.flashMessages.success('general.scheduledSuccessfully');
  }
  <template>
    {{#let (uniqueId) as |templateId|}}
      <div
        role="menubar"
        class="publication-menu {{this.publicationStatus}}"
        id="menu-{{templateId}}"
        data-test-session-publication-menu
        {{onClickOutside (set this "isOpen" false)}}
      >
        <button
          aria-label={{this.title}}
          role="menuitem"
          class="toggle"
          aria-haspopup="true"
          aria-expanded={{if this.isOpen "true" "false"}}
          type="button"
          data-test-toggle
          {{on "keyup" this.keyUp}}
          {{on "click" this.toggleMenu}}
        >
          <FaIcon @icon={{this.icon}} />
          <span>
            {{this.title}}
          </span>
          <FaIcon @icon={{if this.isOpen "caret-down" "caret-right"}} />
        </button>
        {{#if this.isOpen}}
          <div class="menu" role="menu" data-test-menu {{focus}}>
            {{#if this.showAsIs}}
              <button
                class="danger"
                role="menuitem"
                tabindex="-1"
                type="button"
                {{on "click" this.publish}}
                {{on "keyup" this.keyUp}}
                {{on "mouseenter" this.clearFocus}}
                data-test-publish-as-is
              >
                {{t "general.publishAsIs"}}
              </button>
            {{/if}}
            {{#if this.showPublish}}
              <button
                class="good"
                role="menuitem"
                tabindex="-1"
                type="button"
                {{on "click" this.publish}}
                {{on "keyup" this.keyUp}}
                {{on "mouseenter" this.clearFocus}}
                data-test-publish
              >
                {{t "general.publishSession"}}
              </button>
            {{/if}}
            {{#if this.showReview}}
              <button
                class="good"
                role="menuitem"
                tabindex="-1"
                type="button"
                {{on "click" this.scrollToSessionPublication}}
                {{on "keyup" this.keyUp}}
                {{on "mouseenter" this.clearFocus}}
                data-test-review
              >
                {{t "general.reviewMissingItems" count=(get @session "allPublicationIssuesLength")}}
              </button>
            {{/if}}
            {{#if this.showTbd}}
              <button
                class="good"
                role="menuitem"
                tabindex="-1"
                type="button"
                {{on "click" this.publishAsTbd}}
                {{on "keyup" this.keyUp}}
                {{on "mouseenter" this.clearFocus}}
                data-test-tbd
              >
                {{t "general.markAsScheduled"}}
              </button>
            {{/if}}
            {{#if this.showUnPublish}}
              <button
                class="danger"
                role="menuitem"
                tabindex="-1"
                type="button"
                {{on "click" this.unpublish}}
                {{on "keyup" this.keyUp}}
                {{on "mouseenter" this.clearFocus}}
                data-test-un-publish
              >
                {{t "general.unPublishSession"}}
              </button>
            {{/if}}
          </div>
        {{/if}}
      </div>
    {{/let}}
  </template>
}
