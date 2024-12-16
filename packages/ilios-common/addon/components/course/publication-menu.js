import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

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
    if (this.router.currentRouteName === 'course.publication-check') {
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

    return false;
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
  scrollToCoursePublication() {
    this.isOpen = false;
    this.router.transitionTo('course.publication-check', this.args.course);
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
