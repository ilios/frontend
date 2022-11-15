import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

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
    if (this.router.currentRouteName === 'session.publication_check') {
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

  focusOnFirstItem(menuElement) {
    menuElement.querySelector('button:first-of-type').focus();
  }

  @action
  moveFocus({ key, target }) {
    switch (key) {
      case 'ArrowDown':
        if (target.nextElementSibling) {
          target.nextElementSibling.focus();
        } else {
          this.menuElement.querySelector('button:nth-of-type(1)').focus();
        }
        break;
      case 'ArrowUp':
        if (target.previousElementSibling) {
          target.previousElementSibling.focus();
        } else {
          this.menuElement.querySelector('button:last-of-type').focus();
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
  clearFocus() {
    const buttons = this.menuElement.querySelectorAll('button');
    buttons.forEach((el) => el.blur());
  }
  @action
  toggleMenu({ key }) {
    switch (key) {
      case 'ArrowDown':
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
  scrollToSessionPublication() {
    this.isOpen = false;
    this.router.transitionTo('session.publication_check', this.args.session);
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
}
