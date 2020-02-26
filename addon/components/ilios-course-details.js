import Component from '@glimmer/component';
import { action } from '@ember/object';
import scrollIntoView from 'scroll-into-view';

export default class IliosCourseDetailsComponent extends Component {
  @action
  collapse() {
    //when the button is clicked to collapse, animate the focus to the top of the page
    scrollIntoView(this.topSection);
    this.args.setShowDetails(false);
  }
}
