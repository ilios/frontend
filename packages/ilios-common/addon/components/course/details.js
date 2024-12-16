import Component from '@glimmer/component';
import { action } from '@ember/object';
import scrollIntoView from 'scroll-into-view';
import { service } from '@ember/service';

export default class CourseDetailsComponent extends Component {
  @service router;

  @action
  collapse() {
    //when the button is clicked to collapse, animate the focus to the top of the page
    scrollIntoView(document.getElementById('course-top-section'), {
      behavior: 'smooth',
    });
    this.args.setShowDetails(false);
  }

  get notRolloverRoute() {
    return this.router.currentRouteName !== 'course.rollover';
  }
}
