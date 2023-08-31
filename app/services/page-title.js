import EmberPageTitleService from 'ember-page-title/services/page-title';
import { tracked } from '@glimmer/tracking';

/**
 * Extend the page title service in this documented way
 * so that we can see updates to the title when they are made.
 * This is the only way to track this information down.
 */
export default class HeaderTitleService extends EmberPageTitleService {
  @tracked title = '';

  titleDidUpdate(title) {
    this.title = title;
  }
}
