import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CourseSearchResultComponent extends Component {
  @tracked showMore = false;

  get sessions() {
    const { sessions } = this.args.course;
    return this.showMore ? sessions : sessions.slice(0, 3);
  }
}
