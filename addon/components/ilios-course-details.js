import Component from '@glimmer/component';
import { action } from '@ember/object';
import scrollIntoView from 'scroll-into-view';
import { inject as service } from '@ember/service';

export default class IliosCourseDetailsComponent extends Component {
  @service router;

  @action
  collapse() {
    //when the button is clicked to collapse, animate the focus to the top of the page
    scrollIntoView(this.topSection);
    this.args.setShowDetails(false);
  }

  get notRolloverRoute() {
    return this.router.currentRouteName !== 'course.rollover';
  }
}
