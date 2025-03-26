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
    // exception to avoid double-titling in reports
    if (title == 'Ilios Curriculum Reports Subject Reports') {
      this.title = 'Ilios Curriculum Reports';
    } else {
      this.title = title;
    }
  }
}
