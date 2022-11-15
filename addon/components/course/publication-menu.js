import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CoursePublicationMenuComponent extends Component {
  @service router;
  @service intl;
  @service flashMessages;
  @tracked isOpen = false;

  get title() {
    if (this.args.course.publishedAsTbd) {
      return this.intl.t('general.scheduled');
    }
    if (this.args.course.published) {
      return this.intl.t('general.published');
    }
    return this.intl.t('general.notPublished');
  }
  get icon() {
    if (this.args.course.publishedAsTbd) {
      return 'clock';
    }
    if (this.args.course.published) {
      return 'star';
    }
    return 'cloud';
  }

  get showTbd() {
    return !this.args.course.publishedAsTbd;
  }
  get showAsIs() {
    return (
      (!this.args.course.published || this.args.course.publishedAsTbd) &&
      this.args.course.requiredPublicationIssues.length === 0 &&
      this.args.course.allPublicationIssuesLength !== 0
    );
  }
  get showReview() {
    if (this.router.currentRouteName === 'course.publication_check') {
      return false;
    }
    return this.args.course.allPublicationIssuesLength > 0;
  }
  get showPublish() {
    return (
      (!this.args.course.published || this.args.course.publishedAsTbd) &&
      this.args.course.allPublicationIssuesLength === 0
    );
  }
  get showUnPublish() {
    return this.args.course.published || this.args.course.publishedAsTbd;
  }
  get publicationStatus() {
    if (this.args.course.publishedAsTbd) {
      return 'scheduled';
    } else if (this.args.course.published) {
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
  scrollToCoursePublication() {
    this.isOpen = false;
    this.router.transitionTo('course.publication_check', this.args.course);
  }
  @action
  async publish() {
    this.isOpen = false;
    this.args.course.set('publishedAsTbd', false);
    this.args.course.set('published', true);
    await this.args.course.save();
    this.flashMessages.success('general.publishedSuccessfully');
  }
  @action
  async unpublish() {
    this.isOpen = false;
    this.args.course.set('publishedAsTbd', false);
    this.args.course.set('published', false);
    await this.args.course.save();
    this.flashMessages.success('general.unPublishedSuccessfully');
  }
  @action
  async publishAsTbd() {
    this.isOpen = false;
    this.args.course.set('publishedAsTbd', true);
    this.args.course.set('published', true);
    await this.args.course.save();
    this.flashMessages.success('general.scheduledSuccessfully');
  }
}
