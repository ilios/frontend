import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class GlobalScrollService extends Service {
  @service router;
  @tracked displayBackToTop = false;

  onScroll(event, element) {
    if (this.router.currentRouteName === 'dashboard.week') {
      // if inner content is taller than window viewport AND user has scrolled down at all, display back-to-top
      this.displayBackToTop = element.clientHeight > window.innerHeight && window.scrollY > 0;
    }
  }
}
