import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class CourseBackToCoursesComponent extends Component {
  @service router;

  get showLink() {
    try {
      return Boolean(this.router.urlFor('courses'));
    } catch {
      return false;
    }
  }
}
