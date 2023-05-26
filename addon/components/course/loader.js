import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class CourseLoaderComponent extends Component {
  @service dataLoader;
  courseLoadingPromise = this.dataLoader.loadCourse(this.args.course.id);
}
